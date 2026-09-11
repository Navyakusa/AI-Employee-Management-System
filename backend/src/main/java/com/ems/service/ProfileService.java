package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.entity.User;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<User>> getProfile() {

        try {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String email =
                    authentication.getName();

            User user =
                    userRepository
                            .findByEmailIgnoreCase(email)
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

            user.setPassword(null);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Profile retrieved successfully",
                            user
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve profile",
                                    null
                            )
                    );
        }
    }

    public ResponseEntity<ApiResponse<User>> updateProfile(
            String userName,
            String email,
            String department
    ) {

        try {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String currentEmail =
                    authentication.getName();

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
                                        "User not found",
                                        null
                                )
                        );
            }

            if (userName != null &&
                    !userName.trim().isEmpty()) {

                user.setUserName(
                        userName.trim()
                );
            }

            if (email != null &&
                    !email.trim().isEmpty() &&
                    !email.equalsIgnoreCase(currentEmail)) {

                if (userRepository
                        .findByEmailIgnoreCase(email)
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

                user.setEmail(
                        email.trim().toLowerCase()
                );
            }

            if (department != null &&
                    !department.trim().isEmpty()) {

                user.setDepartment(
                        department.trim()
                );
            }

            User updatedUser =
                    userRepository.save(user);

            updatedUser.setPassword(null);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Profile updated successfully",
                            updatedUser
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to update profile",
                                    null
                            )
                    );
        }
    }
}