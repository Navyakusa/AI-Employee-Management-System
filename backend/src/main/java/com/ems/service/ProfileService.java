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

            // -------------------------------------------------
            // Find the Employee record.
            // This is the SAME source used by
            // EmployeeDashboardService.
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
                                        "Employee not found for logged-in user",
                                        null
                                )
                        );
            }

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
            String department
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
            // SAME record used by Dashboard
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

                // Update Employee email as well
                employee.setEmail(newEmail);
            }

            // -------------------------------------------------
            // UPDATE NAME
            // -------------------------------------------------

            if (userName != null
                    && !userName.trim().isEmpty()) {

                String newName =
                        userName.trim();

                // User account name
                user.setUserName(newName);

                // Employee profile name
                employee.setName(newName);
            }

            // -------------------------------------------------
            // UPDATE DEPARTMENT
            // -------------------------------------------------

            if (department != null
                    && !department.trim().isEmpty()) {

                String newDepartment =
                        department.trim();

                // User department
                user.setDepartment(newDepartment);

                // Employee department
                employee.setDepartment(newDepartment);
            }

            // -------------------------------------------------
            // SAVE BOTH
            // -------------------------------------------------

            userRepository.save(user);

            Employee updatedEmployee =
                    employeeRepository.save(employee);

            // -------------------------------------------------
            // BUILD RESPONSE FROM EMPLOYEE
            // -------------------------------------------------

            EmployeeProfileDto profile =
                    new EmployeeProfileDto();

            profile.setEmployeeId(
                    updatedEmployee.getId()
            );

            profile.setEmployeeCode(
                    updatedEmployee.getEmployeeId()
            );

            profile.setName(
                    updatedEmployee.getName()
            );

            profile.setEmail(
                    updatedEmployee.getEmail()
            );

            profile.setDepartment(
                    updatedEmployee.getDepartment()
            );

            profile.setDesignation(
                    updatedEmployee.getDesignation()
            );

            profile.setManager(
                    updatedEmployee.getManager()
            );

            profile.setLocation(
                    updatedEmployee.getLocation()
            );

            profile.setEmploymentType(
                    updatedEmployee.getEmploymentType()
            );

            profile.setStatus(
                    updatedEmployee.getStatus()
            );

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
}