package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.entity.Attendance;
import com.ems.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // MARK ATTENDANCE
    public ResponseEntity<ApiResponse<Attendance>> markAttendance(Attendance attendance) {
        try {
            if (attendance.getEmployeeId() == null) {
                return new ResponseEntity<>(new ApiResponse<>(false, "Employee ID is required", null),
                        HttpStatus.BAD_REQUEST);
            }

            if (attendance.getAttendanceDate() == null) {
                attendance.setAttendanceDate(LocalDate.now());
            }

            long existingAttendance = attendanceRepository.countByEmployeeIdAndAttendanceDate(
                    attendance.getEmployeeId(), attendance.getAttendanceDate());

            if (existingAttendance > 0) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "Attendance already exists for this employee on " + attendance.getAttendanceDate(), null),
                        HttpStatus.CONFLICT);
            }

            Attendance savedAttendance = attendanceRepository.save(attendance);
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance marked successfully", savedAttendance), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // GET ALL ATTENDANCE
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance() {
        try {
            List<Attendance> attendanceList = attendanceRepository.findAll();
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance records fetched successfully", attendanceList), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // GET ATTENDANCE BY ID
    public ResponseEntity<ApiResponse<Attendance>> getAttendanceById(Long id) {
        try {
            Attendance attendance = attendanceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance record fetched successfully", attendance), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.NOT_FOUND);
        }
    }

    // GET ATTENDANCE BY EMPLOYEE
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceByEmployee(Long employeeId) {
        try {
            List<Attendance> attendanceList = attendanceRepository.findByEmployeeId(employeeId);
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Employee attendance fetched successfully", attendanceList), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // GET ATTENDANCE BY DATE
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceByDate(LocalDate date) {
        try {
            List<Attendance> attendanceList = attendanceRepository.findByAttendanceDate(date);
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance records fetched successfully", attendanceList), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // GET ATTENDANCE BY STATUS
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceByStatus(String status) {
        try {
            List<Attendance> attendanceList;
            if (status == null || status.trim().isEmpty()) {
                attendanceList = attendanceRepository.findAll();
            } else {
                attendanceList = attendanceRepository.findByStatusIgnoreCase(status.trim());
            }
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance records fetched successfully", attendanceList), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // UPDATE ATTENDANCE: only update fields supplied by the caller.
    // In particular, a checkout-only request will preserve employee/date/check-in/status/remarks.
    @Transactional
    public ResponseEntity<ApiResponse<Attendance>> updateAttendance(Long id, Attendance updatedAttendance) {
        try {
            if (updatedAttendance == null) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "Attendance request body is required", null), HttpStatus.BAD_REQUEST);
            }

            Attendance attendance = attendanceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));

            if (updatedAttendance.getEmployeeId() != null) {
                attendance.setEmployeeId(updatedAttendance.getEmployeeId());
            }
            if (updatedAttendance.getAttendanceDate() != null) {
                attendance.setAttendanceDate(updatedAttendance.getAttendanceDate());
            }
            if (updatedAttendance.getCheckInTime() != null) {
                attendance.setCheckInTime(updatedAttendance.getCheckInTime());
            }
            if (updatedAttendance.getCheckOutTime() != null) {
                attendance.setCheckOutTime(updatedAttendance.getCheckOutTime());
            }
            if (updatedAttendance.getStatus() != null) {
                attendance.setStatus(updatedAttendance.getStatus());
            }
            if (updatedAttendance.getRemarks() != null) {
                attendance.setRemarks(updatedAttendance.getRemarks());
            }

            Attendance savedAttendance = attendanceRepository.save(attendance);
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance updated successfully", savedAttendance), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE ATTENDANCE
    public ResponseEntity<ApiResponse<Void>> deleteAttendance(Long id) {
        try {
            Attendance attendance = attendanceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));
            attendanceRepository.delete(attendance);
            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance deleted successfully", null), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.NOT_FOUND);
        }
    }


    // Gets the logged-in employee's attendance statistics for a month.
    // Month format: yyyy-MM, for example 2026-10.
    // IMPORTANT: this version assumes authentication.getName() is the numeric employee ID.
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyMonthlyAttendanceStatistics(
            String month, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null
                    || authentication.getName().trim().isEmpty()) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "Authenticated user is required", null), HttpStatus.UNAUTHORIZED);
            }

            final Long employeeId;
            try {
                employeeId = Long.valueOf(authentication.getName().trim());
            } catch (NumberFormatException ex) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "The authenticated username is not a numeric employee ID. Resolve the employee ID from your user account before using this endpoint.",
                        null), HttpStatus.BAD_REQUEST);
            }

            if (month == null || month.trim().isEmpty()) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "Month is required in yyyy-MM format, for example 2026-10", null),
                        HttpStatus.BAD_REQUEST);
            }

            final YearMonth requestedMonth;
            try {
                requestedMonth = YearMonth.parse(month.trim());
            } catch (Exception ex) {
                return new ResponseEntity<>(new ApiResponse<>(false,
                        "Invalid month format. Use yyyy-MM, for example 2026-10", null),
                        HttpStatus.BAD_REQUEST);
            }

            LocalDate startDate = requestedMonth.atDay(1);
            LocalDate endDate = requestedMonth.atEndOfMonth();

            List<Attendance> monthlyAttendance = attendanceRepository.findByEmployeeId(employeeId)
                    .stream()
                    .filter(a -> a.getAttendanceDate() != null)
                    .filter(a -> !a.getAttendanceDate().isBefore(startDate)
                            && !a.getAttendanceDate().isAfter(endDate))
                    .toList();

            long present = monthlyAttendance.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("PRESENT"))
                    .count();
            long absent = monthlyAttendance.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("ABSENT"))
                    .count();
            long onLeave = monthlyAttendance.stream()
                    .filter(a -> a.getStatus() != null
                            && (a.getStatus().equalsIgnoreCase("ON_LEAVE")
                            || a.getStatus().equalsIgnoreCase("ON LEAVE")
                            || a.getStatus().equalsIgnoreCase("LEAVE")))
                    .count();
            long halfDay = monthlyAttendance.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("HALF_DAY"))
                    .count();

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("employeeId", employeeId);
            statistics.put("month", requestedMonth.toString());
            statistics.put("totalRecords", monthlyAttendance.size());
            statistics.put("present", present);
            statistics.put("absent", absent);
            statistics.put("onLeave", onLeave);
            statistics.put("halfDay", halfDay);
            statistics.put("attendance", monthlyAttendance);

            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Monthly attendance statistics fetched successfully", statistics), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false,
                    "Failed to fetch monthly attendance statistics: " + e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // ATTENDANCE STATISTICS
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAttendanceStatistics() {
        try {
            List<Attendance> attendanceList = attendanceRepository.findAll();
            long totalRecords = attendanceList.size();
            long present = attendanceList.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("PRESENT"))
                    .count();
            long absent = attendanceList.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("ABSENT"))
                    .count();
            long onLeave = attendanceList.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("ON_LEAVE"))
                    .count();
            long halfDay = attendanceList.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().equalsIgnoreCase("HALF_DAY"))
                    .count();

            Map<String, Long> statistics = new HashMap<>();
            statistics.put("totalRecords", totalRecords);
            statistics.put("present", present);
            statistics.put("absent", absent);
            statistics.put("onLeave", onLeave);
            statistics.put("halfDay", halfDay);

            return new ResponseEntity<>(new ApiResponse<>(true,
                    "Attendance statistics fetched successfully", statistics), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }
}
