package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.EmployeeProfileDto;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public ProfileService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository) {

        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // GET PROFILE
    // =========================================================

    public ResponseEntity<ApiResponse<EmployeeProfileDto>> getProfile() {

        try {

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

            // Find employee using logged-in user's email
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
                                        "Employee not found for logged-in user",
                                        null
                                )
                        );
            }

            EmployeeProfileDto profile =
                    buildProfileDto(employee);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Profile retrieved successfully",
                            profile
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve profile: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    public ResponseEntity<ApiResponse<EmployeeProfileDto>> updateProfile(
            String userName,
            String email,
            String phone,
            String department,
            String location
    ) {

        try {

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

            String currentEmail =
                    authentication.getName();

            // -------------------------------------------------
            // Find User account
            // -------------------------------------------------

            User user =
                    userRepository
                            .findByEmailIgnoreCase(currentEmail)
                            .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User account not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Find Employee record
            // -------------------------------------------------

            Employee employee =
                    employeeRepository
                            .findByEmailIgnoreCase(currentEmail)
                            .orElse(null);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee record not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // EMAIL DUPLICATE CHECK
            // -------------------------------------------------

            if (email != null
                    && !email.trim().isEmpty()
                    && !email.equalsIgnoreCase(currentEmail)) {

                String newEmail =
                        email.trim().toLowerCase();

                if (userRepository
                        .findByEmailIgnoreCase(newEmail)
                        .isPresent()) {

                    return ResponseEntity
                            .status(HttpStatus.CONFLICT)
                            .body(
                                    new ApiResponse<>(
                                            false,
                                            "Email already registered",
                                            null
                                    )
                            );
                }

                // Update User email
                user.setEmail(newEmail);

                // Update Employee email
                employee.setEmail(newEmail);
            }

            // -------------------------------------------------
            // UPDATE NAME
            // -------------------------------------------------

            if (userName != null
                    && !userName.trim().isEmpty()) {

                String newName =
                        userName.trim();

                user.setUserName(newName);

                employee.setName(newName);
            }

            // -------------------------------------------------
            // UPDATE PHONE
            // -------------------------------------------------

            if (phone != null
                    && !phone.trim().isEmpty()) {

                employee.setPhone(
                        phone.trim()
                );
            }

            // -------------------------------------------------
            // UPDATE DEPARTMENT
            // -------------------------------------------------

            if (department != null
                    && !department.trim().isEmpty()) {

                String newDepartment =
                        department.trim();

                user.setDepartment(newDepartment);

                employee.setDepartment(newDepartment);
            }

            // -------------------------------------------------
            // UPDATE LOCATION
            // -------------------------------------------------

            if (location != null
                    && !location.trim().isEmpty()) {

                employee.setLocation(
                        location.trim()
                );
            }

            // -------------------------------------------------
            // SAVE BOTH
            // -------------------------------------------------

            userRepository.save(user);

            Employee updatedEmployee =
                    employeeRepository.save(employee);

            // -------------------------------------------------
            // BUILD RESPONSE
            // -------------------------------------------------

            EmployeeProfileDto profile =
                    buildProfileDto(updatedEmployee);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Profile updated successfully",
                            profile
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to update profile: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // BUILD PROFILE DTO
    // =========================================================

    private EmployeeProfileDto buildProfileDto(
            Employee employee
    ) {

        EmployeeProfileDto profile =
                new EmployeeProfileDto();

        profile.setEmployeeId(
                employee.getId()
        );

        profile.setEmployeeCode(
                employee.getEmployeeId()
        );

        profile.setName(
                employee.getName()
        );

        profile.setEmail(
                employee.getEmail()
        );

        profile.setPhone(
                employee.getPhone()
        );

        profile.setDepartment(
                employee.getDepartment()
        );

        profile.setDesignation(
                employee.getDesignation()
        );

        profile.setManager(
                employee.getManager()
        );

        profile.setLocation(
                employee.getLocation()
        );

        profile.setEmploymentType(
                employee.getEmploymentType()
        );

        profile.setStatus(
                employee.getStatus()
        );

        return profile;
    }
}