package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AdminUserDto;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AdminUserService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }


    // ============================================================
    // GET USERS
    // ============================================================

    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getUsers(
            String search,
            String role,
            Boolean active
    ) {

        try {

            List<User> users =
                    userRepository.findAllUsersForRecentUsers();

            List<AdminUserDto> result = users.stream()

                    .filter(user -> {

                        if (search == null || search.trim().isEmpty()) {
                            return true;
                        }

                        String searchValue =
                                search.trim().toLowerCase();

                        boolean nameMatches =
                                user.getUserName() != null &&
                                        user.getUserName()
                                                .toLowerCase()
                                                .contains(searchValue);

                        boolean emailMatches =
                                user.getEmail() != null &&
                                        user.getEmail()
                                                .toLowerCase()
                                                .contains(searchValue);

                        return nameMatches || emailMatches;
                    })

                    .filter(user -> {

                        if (role == null || role.trim().isEmpty()) {
                            return true;
                        }

                        return user.getRole() != null &&
                                user.getRole()
                                        .equalsIgnoreCase(role);
                    })

                    .filter(user -> {

                        if (active == null) {
                            return true;
                        }

                        return active.equals(user.getActive());
                    })

                    .map(this::convertToDto)
                    .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Users fetched successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch users",
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // GET USER BY ID
    // ============================================================

    public ResponseEntity<ApiResponse<AdminUserDto>> getUserById(
            Long userId
    ) {

        try {

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "User fetched successfully",
                            convertToDto(user)
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch user",
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // CREATE USER
    // ============================================================

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ApiResponse<AdminUserDto>> createUser(
            AdminUserDto dto
    ) {

        try {

            if (
                    dto.getUserName() == null ||
                            dto.getUserName().trim().isEmpty()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User name is required",
                                        null
                                )
                        );
            }

            if (
                    dto.getEmail() == null ||
                            dto.getEmail().trim().isEmpty()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Email is required",
                                        null
                                )
                        );
            }

            if (
                    dto.getPassword() == null ||
                            dto.getPassword().trim().isEmpty()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Password is required",
                                        null
                                )
                        );
            }

            String email =
                    dto.getEmail()
                            .trim()
                            .toLowerCase();

            if (
                    userRepository
                            .findByEmailIgnoreCase(email)
                            .isPresent()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Email already registered",
                                        null
                                )
                        );
            }

            User user = new User();

            user.setUserName(
                    dto.getUserName().trim()
            );

            user.setEmail(email);

            user.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );

            user.setRole(
                    dto.getRole()
            );

            user.setDepartment(
                    dto.getDepartment()
            );

            user.setActive(
                    dto.getActive() != null
                            ? dto.getActive()
                            : true
            );

            // ====================================================
            // SAVE USER
            // ====================================================

            User savedUser =
                    userRepository.save(user);


            // ====================================================
            // CREATE EMPLOYEE AUTOMATICALLY
            // ====================================================

            if (
                    savedUser.getRole() != null &&
                            savedUser.getRole()
                                    .equalsIgnoreCase("EMPLOYEE")
            ) {

                String employeeEmail =
                        savedUser.getEmail();

                // Prevent duplicate Employee
                if (
                        employeeRepository
                                .findByEmailIgnoreCase(employeeEmail)
                                .isPresent()
                ) {

                    throw new RuntimeException(
                            "Employee record already exists for email: "
                                    + employeeEmail
                    );
                }

                Employee employee =
                        new Employee();

                // Data available from Create User
                employee.setName(
                        savedUser.getUserName()
                );

                employee.setEmail(
                        employeeEmail
                );

                employee.setDepartment(
                        savedUser.getDepartment()
                );

                // Generate employee ID
                employee.setEmployeeId(
                        "EMP-" +
                                String.format(
                                        "%04d",
                                        savedUser.getUserId()
                                )
                );

                // Default employee values
                employee.setStatus("ACTIVE");

                employee.setJoiningDate(
                        LocalDate.now()
                );

                // Not available from Create User request
                employee.setPhone(null);
                employee.setDesignation(null);
                employee.setManager(null);
                employee.setLocation(null);
                employee.setEmploymentType(null);

                Employee savedEmployee = employeeRepository.save(employee);

                // ====================================================
                // CREATE LEAVE BALANCE AUTOMATICALLY
                // ====================================================
                if (leaveBalanceRepository.findByEmployeeId(savedEmployee.getId()).isEmpty()) {
                    LeaveBalance leaveBalance = LeaveBalance.builder()
                            .employeeId(savedEmployee.getId())
                            .annualLeave(20)
                            .casualLeave(12)
                            .sickLeave(12)
                            .maternityLeave(180)
                            .paternityLeave(15)
                            .otherLeave(5)
                            .unpaidLeave(0)
                            .build();

                    leaveBalanceRepository.save(leaveBalance);
                }
            }


            // ====================================================
            // AUDIT LOG
            // ====================================================

            createAuditLogSafely(
                    "CREATE",
                    "Created user: " +
                            savedUser.getEmail()
            );


            // ====================================================
            // NOTIFICATION
            // ====================================================

            createNotificationSafely(
                    savedUser.getUserId(),
                    "User " +
                            savedUser.getUserName() +
                            " (" +
                            savedUser.getEmail() +
                            ") was created",
                    "USER_CREATED"
            );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "User created successfully",
                                    convertToDto(savedUser)
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            /*
             * Important:
             * If Employee creation fails, rollback User creation too.
             */
            TransactionAspectSupport
                    .currentTransactionStatus()
                    .setRollbackOnly();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to create user: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // UPDATE USER
    // ============================================================

    public ResponseEntity<ApiResponse<AdminUserDto>> updateUser(
            Long userId,
            AdminUserDto dto
    ) {

        try {

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            if (
                    dto.getEmail() != null &&
                            !dto.getEmail().trim().isEmpty()
            ) {

                User existingUser =
                        userRepository
                                .findByEmailIgnoreCase(
                                        dto.getEmail()
                                )
                                .orElse(null);

                if (
                        existingUser != null &&
                                !existingUser
                                        .getUserId()
                                        .equals(userId)
                ) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    new ApiResponse<>(
                                            false,
                                            "Email already registered",
                                            null
                                    )
                            );
                }
            }

            if (
                    dto.getUserName() != null &&
                            !dto.getUserName().trim().isEmpty()
            ) {

                user.setUserName(
                        dto.getUserName().trim()
                );
            }

            if (
                    dto.getEmail() != null &&
                            !dto.getEmail().trim().isEmpty()
            ) {

                user.setEmail(
                        dto.getEmail()
                                .trim()
                                .toLowerCase()
                );
            }

            if (
                    dto.getRole() != null &&
                            !dto.getRole().trim().isEmpty()
            ) {

                user.setRole(
                        dto.getRole()
                );
            }

            if (dto.getDepartment() != null) {

                user.setDepartment(
                        dto.getDepartment()
                );
            }

            if (dto.getActive() != null) {

                user.setActive(
                        dto.getActive()
                );
            }

            if (
                    dto.getPassword() != null &&
                            !dto.getPassword().trim().isEmpty()
            ) {

                user.setPassword(
                        passwordEncoder.encode(
                                dto.getPassword()
                        )
                );
            }

            User updatedUser =
                    userRepository.save(user);

            createAuditLogSafely(
                    "UPDATE",
                    "Updated user: " +
                            updatedUser.getEmail()
            );

            createNotificationSafely(
                    updatedUser.getUserId(),
                    "User " +
                            updatedUser.getUserName() +
                            " (" +
                            updatedUser.getEmail() +
                            ") was updated",
                    "USER_UPDATED"
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "User updated successfully",
                            convertToDto(updatedUser)
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to update user: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // ACTIVATE / DEACTIVATE USER
    // ============================================================

    public ResponseEntity<ApiResponse<AdminUserDto>> updateStatus(
            Long userId,
            Boolean active
    ) {

        try {

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            if (active == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Active status is required",
                                        null
                                )
                        );
            }

            user.setActive(active);

            User updatedUser =
                    userRepository.save(user);

            createAuditLogSafely(
                    "STATUS",
                    active
                            ? "Activated user: " +
                            updatedUser.getEmail()
                            : "Deactivated user: " +
                            updatedUser.getEmail()
            );

            if (active) {

                createNotificationSafely(
                        updatedUser.getUserId(),
                        "User " +
                                updatedUser.getUserName() +
                                " was activated",
                        "USER_ACTIVATED"
                );

            } else {

                createNotificationSafely(
                        updatedUser.getUserId(),
                        "User " +
                                updatedUser.getUserName() +
                                " was deactivated",
                        "USER_DEACTIVATED"
                );
            }

            String message =
                    active
                            ? "User activated successfully"
                            : "User deactivated successfully";

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            message,
                            convertToDto(updatedUser)
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to update user status: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // DELETE USER
    // ============================================================

    public ResponseEntity<ApiResponse<Void>> deleteUser(
            Long userId
    ) {

        try {

            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            String deletedUserEmail =
                    user.getEmail();

            String deletedUserName =
                    user.getUserName();

            userRepository.delete(user);

            createAuditLogSafely(
                    "DELETE",
                    "Deleted user: " +
                            deletedUserEmail +
                            " (" +
                            deletedUserName +
                            ")"
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "User deleted successfully",
                            null
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to delete user: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // CREATE NOTIFICATION SAFELY
    // ============================================================

    private void createNotificationSafely(
            Long recipientUserId,
            String message,
            String type
    ) {

        try {

            if (recipientUserId == null) {

                System.out.println(
                        "Notification not created: "
                                + "recipient user ID is null"
                );

                return;
            }

            notificationService
                    .createNotification(
                            recipientUserId,
                            message,
                            type
                    );

        } catch (Exception e) {

            System.out.println(
                    "Notification save failed: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }
    }


    // ============================================================
    // GET CURRENT USER ID
    // ============================================================

    private Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                        !authentication.isAuthenticated() ||
                        "anonymousUser"
                                .equals(authentication.getPrincipal())
        ) {

            return null;
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

        if (user == null) {
            return null;
        }

        return user.getUserId();
    }


    // ============================================================
    // AUDIT LOG SAFELY
    // ============================================================

    private void createAuditLogSafely(
            String action,
            String details
    ) {

        try {

            auditLogService.createAuditLog(
                    "USERS",
                    action,
                    details,
                    getCurrentUser()
            );

        } catch (Exception e) {

            System.out.println(
                    "Audit log save failed: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }
    }


    // ============================================================
    // CURRENT USER
    // ============================================================

    private String getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                        !authentication.isAuthenticated()
        ) {

            return "SYSTEM";
        }

        return authentication.getName();
    }


    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private AdminUserDto convertToDto(
            User user
    ) {

        AdminUserDto dto =
                new AdminUserDto();

        dto.setUserId(
                user.getUserId()
        );

        dto.setUserName(
                user.getUserName()
        );

        dto.setDepartment(
                user.getDepartment()
        );

        dto.setEmail(
                user.getEmail()
        );

        dto.setRole(
                user.getRole()
        );

        dto.setActive(
                user.getActive()
        );

        dto.setPassword(null);

        return dto;
    }
}