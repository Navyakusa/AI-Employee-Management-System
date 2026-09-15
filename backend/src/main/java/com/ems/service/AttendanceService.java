package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.entity.Attendance;
import com.ems.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;


    // =========================
    // MARK ATTENDANCE
    // =========================

    public ResponseEntity<ApiResponse<Attendance>> markAttendance(
            Attendance attendance) {

        try {

            if (attendance.getAttendanceDate() == null) {
                attendance.setAttendanceDate(LocalDate.now());
            }

            Attendance savedAttendance =
                    attendanceRepository.save(attendance);

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            true,
                            "Attendance marked successfully",
                            savedAttendance
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.CREATED
            );

        } catch (Exception e) {

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // GET ALL ATTENDANCE
    // =========================

    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance() {

        try {

            List<Attendance> attendanceList =
                    attendanceRepository.findAll();

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            true,
                            "Attendance records fetched successfully",
                            attendanceList
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // GET ATTENDANCE BY ID
    // =========================

    public ResponseEntity<ApiResponse<Attendance>> getAttendanceById(
            Long id) {

        try {

            Attendance attendance =
                    attendanceRepository
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attendance record not found"
                                    )
                            );

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            true,
                            "Attendance record fetched successfully",
                            attendance
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.NOT_FOUND
            );
        }
    }


    // =========================
    // GET BY EMPLOYEE
    // =========================

    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByEmployee(Long employeeId) {

        try {

            List<Attendance> attendanceList =
                    attendanceRepository.findByEmployeeId(employeeId);

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            true,
                            "Employee attendance fetched successfully",
                            attendanceList
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // GET BY DATE
    // =========================

    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByDate(LocalDate date) {

        try {

            List<Attendance> attendanceList =
                    attendanceRepository.findByAttendanceDate(date);

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            true,
                            "Attendance records fetched successfully",
                            attendanceList
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // GET BY STATUS
    // =========================

    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByStatus(String status) {

        try {

            List<Attendance> attendanceList;

            if (status == null || status.trim().isEmpty()) {

                attendanceList =
                        attendanceRepository.findAll();

            } else {

                attendanceList =
                        attendanceRepository
                                .findByStatusIgnoreCase(
                                        status.trim()
                                );
            }

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            true,
                            "Attendance records fetched successfully",
                            attendanceList
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Attendance>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // UPDATE ATTENDANCE
    // =========================

    public ResponseEntity<ApiResponse<Attendance>> updateAttendance(
            Long id,
            Attendance updatedAttendance) {

        try {

            Attendance attendance =
                    attendanceRepository
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attendance record not found"
                                    )
                            );

            attendance.setEmployeeId(
                    updatedAttendance.getEmployeeId()
            );

            attendance.setAttendanceDate(
                    updatedAttendance.getAttendanceDate()
            );

            attendance.setCheckInTime(
                    updatedAttendance.getCheckInTime()
            );

            attendance.setCheckOutTime(
                    updatedAttendance.getCheckOutTime()
            );

            attendance.setStatus(
                    updatedAttendance.getStatus()
            );

            attendance.setRemarks(
                    updatedAttendance.getRemarks()
            );

            Attendance savedAttendance =
                    attendanceRepository.save(attendance);

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            true,
                            "Attendance updated successfully",
                            savedAttendance
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Attendance> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // DELETE ATTENDANCE
    // =========================

    public ResponseEntity<ApiResponse<Void>> deleteAttendance(
            Long id) {

        try {

            Attendance attendance =
                    attendanceRepository
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attendance record not found"
                                    )
                            );

            attendanceRepository.delete(attendance);

            ApiResponse<Void> response =
                    new ApiResponse<>(
                            true,
                            "Attendance deleted successfully",
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Void> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.NOT_FOUND
            );
        }
    }


    // =========================
    // ATTENDANCE STATISTICS
    // =========================

    public ResponseEntity<ApiResponse<Map<String, Long>>>
    getAttendanceStatistics() {

        try {

            List<Attendance> attendanceList =
                    attendanceRepository.findAll();

            long totalRecords =
                    attendanceList.size();

            long present =
                    attendanceList.stream()
                            .filter(record ->
                                    record.getStatus() != null
                                            && record.getStatus()
                                            .equalsIgnoreCase("PRESENT")
                            )
                            .count();

            long absent =
                    attendanceList.stream()
                            .filter(record ->
                                    record.getStatus() != null
                                            && record.getStatus()
                                            .equalsIgnoreCase("ABSENT")
                            )
                            .count();

            long onLeave =
                    attendanceList.stream()
                            .filter(record ->
                                    record.getStatus() != null
                                            && record.getStatus()
                                            .equalsIgnoreCase("ON_LEAVE")
                            )
                            .count();

            long halfDay =
                    attendanceList.stream()
                            .filter(record ->
                                    record.getStatus() != null
                                            && record.getStatus()
                                            .equalsIgnoreCase("HALF_DAY")
                            )
                            .count();

            Map<String, Long> statistics =
                    new HashMap<>();

            statistics.put(
                    "totalRecords",
                    totalRecords
            );

            statistics.put(
                    "present",
                    present
            );

            statistics.put(
                    "absent",
                    absent
            );

            statistics.put(
                    "onLeave",
                    onLeave
            );

            statistics.put(
                    "halfDay",
                    halfDay
            );

            ApiResponse<Map<String, Long>> response =
                    new ApiResponse<>(
                            true,
                            "Attendance statistics fetched successfully",
                            statistics
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Map<String, Long>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}