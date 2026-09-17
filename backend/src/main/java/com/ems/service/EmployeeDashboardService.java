package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.EmployeeDashboardDto;
import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.entity.Notification;
import com.ems.entity.User;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.NotificationRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class EmployeeDashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public EmployeeDashboardService(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET EMPLOYEE DASHBOARD
    // =========================================================

    public ResponseEntity<ApiResponse<EmployeeDashboardDto>>
    getDashboardSummary() {

        try {

            // =================================================
            // 1. GET LOGGED-IN USER FROM SECURITY CONTEXT
            // =================================================

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (authentication == null
                    || authentication.getName() == null
                    || authentication.getName().isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User is not authenticated",
                                        null
                                )
                        );
            }

            String email = authentication.getName();


            // =================================================
            // DEBUG INFORMATION
            // =================================================

            System.out.println("=================================");
            System.out.println("EMPLOYEE DASHBOARD AUTH DEBUG");
            System.out.println(
                    "Authentication name = "
                            + authentication.getName()
            );
            System.out.println(
                    "Authentication principal = "
                            + authentication.getPrincipal()
            );
            System.out.println(
                    "Authentication authorities = "
                            + authentication.getAuthorities()
            );
            System.out.println(
                    "Email used for employee lookup = "
                            + email
            );
            System.out.println("=================================");


            // =================================================
            // 2. FIND EMPLOYEE USING EMAIL
            // =================================================

            Employee employee =
                    employeeRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            if (employee == null) {

                System.out.println(
                        "NO EMPLOYEE FOUND FOR EMAIL: "
                                + email
                );

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found for logged-in user",
                                        null
                                )
                        );
            }


            System.out.println(
                    "EMPLOYEE FOUND: "
                            + employee.getId()
                            + " - "
                            + employee.getName()
            );


            // =================================================
            // 3. CREATE DASHBOARD DTO
            // =================================================

            EmployeeDashboardDto dashboard =
                    new EmployeeDashboardDto();


            // =================================================
            // 4. EMPLOYEE INFORMATION
            // =================================================

            dashboard.setEmployeeId(
                    employee.getId()
            );

            dashboard.setEmployeeCode(
                    employee.getEmployeeId()
            );

            dashboard.setName(
                    employee.getName()
            );

            dashboard.setEmail(
                    employee.getEmail()
            );

            dashboard.setDepartment(
                    employee.getDepartment()
            );

            dashboard.setDesignation(
                    employee.getDesignation()
            );

            dashboard.setManager(
                    employee.getManager()
            );

            dashboard.setLocation(
                    employee.getLocation()
            );

            dashboard.setEmploymentType(
                    employee.getEmploymentType()
            );

            dashboard.setEmployeeStatus(
                    employee.getStatus()
            );


            // =================================================
            // 5. TODAY'S ATTENDANCE
            // =================================================

            LocalDate today =
                    LocalDate.now();

            List<Attendance> attendanceList =
                    attendanceRepository
                            .findByEmployeeIdAndAttendanceDate(
                                    employee.getId(),
                                    today
                            );

            if (attendanceList.isEmpty()) {

                dashboard.setAttendanceStatus(
                        "NOT_MARKED"
                );

                dashboard.setCheckInTime(
                        null
                );

                dashboard.setCheckOutTime(
                        null
                );

                dashboard.setWorkingHours(
                        "0h 0m"
                );

            } else {

                Attendance attendance =
                        attendanceList.get(0);

                dashboard.setAttendanceStatus(
                        attendance.getStatus()
                );

                LocalTime checkIn =
                        attendance.getCheckInTime();

                LocalTime checkOut =
                        attendance.getCheckOutTime();


                if (checkIn != null) {

                    dashboard.setCheckInTime(
                            checkIn.toString()
                    );

                } else {

                    dashboard.setCheckInTime(
                            null
                    );
                }


                if (checkOut != null) {

                    dashboard.setCheckOutTime(
                            checkOut.toString()
                    );

                } else {

                    dashboard.setCheckOutTime(
                            null
                    );
                }


                dashboard.setWorkingHours(
                        calculateWorkingHours(
                                checkIn,
                                checkOut
                        )
                );
            }


            // =================================================
            // 6. FIND USER FOR NOTIFICATIONS
            // =================================================

            User user =
                    userRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            if (user != null) {

                // ---------------------------------------------
                // UNREAD NOTIFICATION COUNT
                // ---------------------------------------------

                long unreadCount =
                        notificationRepository
                                .countByUserIdAndReadStatusFalse(
                                        user.getUserId()
                                );

                dashboard.setUnreadNotificationCount(
                        unreadCount
                );


                // ---------------------------------------------
                // ALL NOTIFICATIONS
                // ---------------------------------------------

                List<Notification> notifications =
                        notificationRepository
                                .findByUserIdOrderByCreatedAtDesc(
                                        user.getUserId()
                                );

                dashboard.setNotifications(
                        notifications
                );

            } else {

                dashboard.setUnreadNotificationCount(
                        0L
                );

                dashboard.setNotifications(
                        List.of()
                );
            }


            // =================================================
            // 7. RETURN SUCCESS RESPONSE
            // =================================================

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Employee dashboard retrieved successfully",
                            dashboard
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve employee dashboard: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // CALCULATE WORKING HOURS
    // =========================================================

    private String calculateWorkingHours(
            LocalTime checkIn,
            LocalTime checkOut) {

        if (checkIn == null
                || checkOut == null) {

            return "0h 0m";
        }

        if (checkOut.isBefore(checkIn)) {

            return "0h 0m";
        }

        Duration duration =
                Duration.between(
                        checkIn,
                        checkOut
                );

        long hours =
                duration.toHours();

        long minutes =
                duration.toMinutesPart();

        return hours + "h " + minutes + "m";
    }
}