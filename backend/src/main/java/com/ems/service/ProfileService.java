
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
import org.springframework.transaction.annotation.Transactional;

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
            Authentication authentication = getAuthentication();

            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(
                                false,
                                "User is not authenticated",
                                null
                        ));
            }

            String email = authentication.getName().trim();

            // First, look for a complete employee profile.
            Employee employee = employeeRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (employee != null) {
                EmployeeProfileDto profile = buildProfileDto(employee);

                return ResponseEntity.ok(new ApiResponse<>(
                        true,
                        "Profile retrieved successfully",
                        profile
                ));
            }

            // If there is no employee record, use the user account.
            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "No user account found for the logged-in user",
                                null
                        ));
            }

            EmployeeProfileDto profile = buildProfileDto(user);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User profile retrieved successfully. Employee profile is not yet created.",
                    profile
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve profile",
                            null
                    ));
        }
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<EmployeeProfileDto>> updateProfile(
            String userName,
            String email,
            String phone,
            String department,
            String location) {

        try {
            Authentication authentication = getAuthentication();

            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(
                                false,
                                "User is not authenticated",
                                null
                        ));
            }

            String currentEmail = authentication.getName().trim();

            // Find the authenticated user account.
            User user = userRepository
                    .findByEmailIgnoreCase(currentEmail)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "User account not found",
                                null
                        ));
            }

            String newEmail = currentEmail;

            if (email != null && !email.trim().isEmpty()) {
                newEmail = email.trim();

                if (!newEmail.equalsIgnoreCase(currentEmail)
                        && userRepository
                        .findByEmailIgnoreCase(newEmail)
                        .isPresent()) {

                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ApiResponse<>(
                                    false,
                                    "Email already registered",
                                    null
                            ));
                }
            }

            // Find an employee record if one exists.
            Employee employee = employeeRepository
                    .findByEmailIgnoreCase(currentEmail)
                    .orElse(null);

            // Update fields supported by the User entity.
            if (userName != null && !userName.trim().isEmpty()) {
                user.setUserName(userName.trim());
            }

            if (email != null && !email.trim().isEmpty()) {
                user.setEmail(newEmail);
            }

            if (department != null && !department.trim().isEmpty()) {
                user.setDepartment(department.trim());
            }

            // If an employee record exists, update its fields too.
            if (employee != null) {

                if (email != null && !email.trim().isEmpty()) {
                    employee.setEmail(newEmail);
                }

                if (userName != null && !userName.trim().isEmpty()) {
                    employee.setName(userName.trim());
                }

                if (department != null && !department.trim().isEmpty()) {
                    employee.setDepartment(department.trim());
                }

                if (phone != null && !phone.trim().isEmpty()) {
                    employee.setPhone(phone.trim());
                }

                if (location != null && !location.trim().isEmpty()) {
                    employee.setLocation(location.trim());
                }

                employeeRepository.save(employee);
            }

            userRepository.save(user);

            // Build the response from the record available.
            EmployeeProfileDto profile;

            if (employee != null) {
                profile = buildProfileDto(employee);
            } else {
                profile = buildProfileDto(user);
            }

            String message = employee != null
                    ? "Profile updated successfully"
                    : "User account updated successfully. Phone and location cannot be saved until an employee profile exists.";

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    message,
                    profile
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to update profile",
                            null
                    ));
        }
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private Authentication getAuthentication() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {
            return null;
        }

        return authentication;
    }

    // =========================================================
    // BUILD DTO FROM EMPLOYEE
    // =========================================================

    private EmployeeProfileDto buildProfileDto(Employee employee) {
        EmployeeProfileDto profile = new EmployeeProfileDto();

        profile.setEmployeeId(employee.getId());
        profile.setEmployeeCode(employee.getEmployeeId());
        profile.setName(employee.getName());
        profile.setEmail(employee.getEmail());
        profile.setPhone(employee.getPhone());
        profile.setDepartment(employee.getDepartment());
        profile.setDesignation(employee.getDesignation());
        profile.setManager(employee.getManager());
        profile.setLocation(employee.getLocation());
        profile.setEmploymentType(employee.getEmploymentType());
        profile.setStatus(employee.getStatus());

        return profile;
    }

    // =========================================================
    // BUILD DTO FROM USER
    // =========================================================

    private EmployeeProfileDto buildProfileDto(User user) {
        EmployeeProfileDto profile = new EmployeeProfileDto();

        // A User without an Employee record has no employee ID/code.
        profile.setEmployeeId(null);
        profile.setEmployeeCode(null);
        profile.setName(user.getUserName());
        profile.setEmail(user.getEmail());
        profile.setDepartment(user.getDepartment());

        // These details belong to Employee in the existing design.
        profile.setPhone(null);
        profile.setDesignation(null);
        profile.setManager(null);
        profile.setLocation(null);
        profile.setEmploymentType(null);
        profile.setStatus(null);

        return profile;
    }
}
