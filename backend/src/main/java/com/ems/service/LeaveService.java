
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.LeaveRequestDto;
import com.ems.dto.LeaveResponseDto;
import com.ems.dto.LeaveSummaryDto;
import com.ems.dto.LeaveTypeDto;
import com.ems.entity.Employee;
import com.ems.entity.Leave;
import com.ems.entity.LeaveBalance;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.LeaveRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            EmployeeRepository employeeRepository) {

        this.leaveRepository = leaveRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }


    // =========================================================
    // APPLY LEAVE
    // =========================================================

    public ResponseEntity<ApiResponse<LeaveResponseDto>> applyLeave(
            LeaveRequestDto request,
            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 1. Get logged-in user's email
            // -------------------------------------------------

            String email = authentication.getName();

            if (email == null || email.isBlank()) {

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


            // -------------------------------------------------
            // 2. Find employee
            // -------------------------------------------------

            Employee employee =
                    employeeRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 3. Validate dates
            // -------------------------------------------------

            if (request.getFromDate() == null
                    || request.getToDate() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "From date and To date are required",
                                        null
                                )
                        );
            }


            if (request.getToDate()
                    .isBefore(request.getFromDate())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "To date cannot be before From date",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 4. Calculate number of days
            // -------------------------------------------------

            int days =
                    (int) ChronoUnit.DAYS.between(
                            request.getFromDate(),
                            request.getToDate()
                    ) + 1;


            // -------------------------------------------------
            // 5. Check overlapping leave requests
            // -------------------------------------------------

            List<Leave> existingLeaves =
                    leaveRepository
                            .findByEmployeeIdOrderByAppliedOnDesc(
                                    employee.getId()
                            );

            boolean overlappingLeave =
                    existingLeaves.stream()
                            .anyMatch(leave -> {

                                if ("REJECTED"
                                        .equalsIgnoreCase(
                                                leave.getStatus())) {

                                    return false;
                                }

                                boolean startsBeforeOrOnEnd =
                                        !request.getFromDate()
                                                .isAfter(
                                                        leave.getToDate()
                                                );

                                boolean endsAfterOrOnStart =
                                        !request.getToDate()
                                                .isBefore(
                                                        leave.getFromDate()
                                                );

                                return startsBeforeOrOnEnd
                                        && endsAfterOrOnStart;
                            });

            if (overlappingLeave) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Leave request overlaps with an existing leave request",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 6. Check leave balance
            // -------------------------------------------------

            LeaveBalance balance =
                    leaveBalanceRepository
                            .findByEmployeeId(
                                    employee.getId()
                            )
                            .orElse(null);

            if (balance == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Leave balance is not configured for this employee",
                                        null
                                )
                        );
            }


            int availableLeave =
                    getAvailableLeave(
                            balance,
                            request.getLeaveType()
                    );


            // Unpaid Leave does not require available balance.
            boolean isUnpaid =
                    "UNPAID".equalsIgnoreCase(
                            normalizeLeaveType(
                                    request.getLeaveType()
                            )
                    );

            if (!isUnpaid
                    && days > availableLeave) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Insufficient leave balance. Available days: "
                                                + availableLeave,
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 7. Create leave
            // -------------------------------------------------

            Leave leave =
                    Leave.builder()
                            .employeeId(employee.getId())
                            .leaveType(
                                    request.getLeaveType()
                            )
                            .fromDate(
                                    request.getFromDate()
                            )
                            .toDate(
                                    request.getToDate()
                            )
                            .days(days)
                            .reason(
                                    request.getReason()
                            )
                            .status("PENDING")
                            .appliedOn(
                                    LocalDateTime.now()
                            )
                            .build();


            Leave savedLeave =
                    leaveRepository.save(leave);


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Leave request submitted successfully",
                                    mapToResponseDto(savedLeave)
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to apply leave: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET MY LEAVE REQUESTS
    // =========================================================

    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>>
    getMyLeaves(Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(authentication);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            List<Leave> leaves =
                    leaveRepository
                            .findByEmployeeIdOrderByAppliedOnDesc(
                                    employee.getId()
                            );


            List<LeaveResponseDto> response =
                    leaves.stream()
                            .map(this::mapToResponseDto)
                            .collect(Collectors.toList());


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Leave requests fetched successfully",
                            response
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch leave requests: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET MY LEAVE BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<LeaveResponseDto>>
    getMyLeaveById(
            Long leaveId,
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(authentication);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            Leave leave =
                    leaveRepository
                            .findById(leaveId)
                            .orElse(null);

            if (leave == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Leave request not found",
                                        null
                                )
                        );
            }


            // Employee can access only their own leave
            if (!leave.getEmployeeId()
                    .equals(employee.getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to access this leave request",
                                        null
                                )
                        );
            }


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Leave request fetched successfully",
                            mapToResponseDto(leave)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch leave request: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET LEAVE SUMMARY
    // =========================================================

    public ResponseEntity<ApiResponse<LeaveSummaryDto>>
    getLeaveSummary(Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(authentication);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            LeaveBalance balance =
                    leaveBalanceRepository
                            .findByEmployeeId(
                                    employee.getId()
                            )
                            .orElse(null);

            if (balance == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Leave balance is not configured for this employee",
                                        null
                                )
                        );
            }


            List<Leave> leaves =
                    leaveRepository
                            .findByEmployeeIdOrderByAppliedOnDesc(
                                    employee.getId()
                            );


            // -------------------------------------------------
            // Pending requests count
            // -------------------------------------------------

            int pendingRequests =
                    (int) leaves.stream()
                            .filter(leave ->
                                    "PENDING".equalsIgnoreCase(
                                            leave.getStatus()
                                    )
                            )
                            .count();


            // -------------------------------------------------
            // Approved leave days
            // -------------------------------------------------

            int approvedDays =
                    leaves.stream()
                            .filter(leave ->
                                    "APPROVED".equalsIgnoreCase(
                                            leave.getStatus()
                                    )
                            )
                            .mapToInt(Leave::getDays)
                            .sum();


            // -------------------------------------------------
            // Used leave
            //
            // Approved leave whose dates have started/passed.
            // -------------------------------------------------

            LocalDate today =
                    LocalDate.now();

            int usedLeave =
                    leaves.stream()
                            .filter(leave ->
                                    "APPROVED".equalsIgnoreCase(
                                            leave.getStatus()
                                    )
                            )
                            .mapToInt(leave ->
                                    calculateUsedDays(
                                            leave,
                                            today
                                    )
                            )
                            .sum();


            // -------------------------------------------------
            // Total available balance
            // -------------------------------------------------

            int totalBalance =
                    getTotalPaidLeaveBalance(
                            balance
                    );


            int remainingBalance =
                    Math.max(
                            totalBalance - approvedDays,
                            0
                    );


            LeaveSummaryDto summary =
                    LeaveSummaryDto.builder()
                            .leaveBalance(
                                    remainingBalance
                            )
                            .pendingRequests(
                                    pendingRequests
                            )
                            .approvedLeave(
                                    approvedDays
                            )
                            .usedLeave(
                                    usedLeave
                            )
                            .build();


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Leave summary fetched successfully",
                            summary
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch leave summary: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET LEAVE TYPES
    // =========================================================

    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>>
    getLeaveTypes() {

        List<LeaveTypeDto> leaveTypes =
                List.of(
                        new LeaveTypeDto("Casual Leave"),
                        new LeaveTypeDto("Sick Leave"),
                        new LeaveTypeDto("Annual Leave"),
                        new LeaveTypeDto("Unpaid Leave"),
                        new LeaveTypeDto("Maternity Leave"),
                        new LeaveTypeDto("Paternity Leave"),
                        new LeaveTypeDto("Other")
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Leave types fetched successfully",
                        leaveTypes
                )
        );
    }


    // =========================================================
    // GET LOGGED-IN EMPLOYEE
    // =========================================================

    private Employee getLoggedInEmployee(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            return null;
        }

        String email =
                authentication.getName();

        return employeeRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);
    }


    // =========================================================
    // GET AVAILABLE LEAVE FOR TYPE
    // =========================================================

    private int getAvailableLeave(
            LeaveBalance balance,
            String leaveType) {

        String normalized =
                normalizeLeaveType(leaveType);

        return switch (normalized) {

            case "CASUAL" ->
                    safeValue(
                            balance.getCasualLeave()
                    );

            case "SICK" ->
                    safeValue(
                            balance.getSickLeave()
                    );

            case "ANNUAL" ->
                    safeValue(
                            balance.getAnnualLeave()
                    );

            case "UNPAID" ->
                    safeValue(
                            balance.getUnpaidLeave()
                    );

            case "MATERNITY" ->
                    safeValue(
                            balance.getMaternityLeave()
                    );

            case "PATERNITY" ->
                    safeValue(
                            balance.getPaternityLeave()
                    );

            case "OTHER" ->
                    safeValue(
                            balance.getOtherLeave()
                    );

            default ->
                    0;
        };
    }


    // =========================================================
    // TOTAL PAID LEAVE BALANCE
    // =========================================================

    private int getTotalPaidLeaveBalance(
            LeaveBalance balance) {

        return safeValue(balance.getCasualLeave())
                + safeValue(balance.getSickLeave())
                + safeValue(balance.getAnnualLeave())
                + safeValue(balance.getMaternityLeave())
                + safeValue(balance.getPaternityLeave())
                + safeValue(balance.getOtherLeave());
    }


    // =========================================================
    // CALCULATE USED DAYS
    // =========================================================

    private int calculateUsedDays(
            Leave leave,
            LocalDate today) {

        if (leave.getFromDate() == null
                || leave.getToDate() == null) {

            return 0;
        }

        // Future leave has not been used yet.
        if (leave.getFromDate()
                .isAfter(today)) {

            return 0;
        }

        LocalDate usedUntil =
                leave.getToDate()
                        .isBefore(today)
                        ? leave.getToDate()
                        : today;

        return (int) ChronoUnit.DAYS.between(
                leave.getFromDate(),
                usedUntil
        ) + 1;
    }


    // =========================================================
    // NORMALIZE LEAVE TYPE
    // =========================================================

    private String normalizeLeaveType(
            String leaveType) {

        if (leaveType == null) {
            return "";
        }

        return leaveType
                .trim()
                .toUpperCase()
                .replace(
                        " LEAVE",
                        ""
                );
    }


    // =========================================================
    // SAFE INTEGER VALUE
    // =========================================================

    private int safeValue(Integer value) {

        return value == null
                ? 0
                : value;
    }


    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private LeaveResponseDto mapToResponseDto(
            Leave leave) {

        return LeaveResponseDto.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployeeId())
                .leaveType(leave.getLeaveType())
                .fromDate(leave.getFromDate())
                .toDate(leave.getToDate())
                .days(leave.getDays())
                .reason(leave.getReason())
                .appliedOn(leave.getAppliedOn())
                .status(leave.getStatus())
                .build();
    }
}