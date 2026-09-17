package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.RecruiterSettings;
import com.ems.entity.User;
import com.ems.repository.RecruiterSettingsRepository;
import com.ems.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecruiterSettingsService {

    private final RecruiterSettingsRepository settingsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // =====================================================
    // GET SETTINGS
    // =====================================================

    public ResponseEntity<ApiResponse<RecruiterSettingsResponseDto>>
    getSettings(Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            RecruiterSettings settings =
                    getOrCreateSettings(user);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Recruiter settings fetched successfully",
                            buildResponse(user, settings)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =====================================================
    // UPDATE SETTINGS
    // =====================================================

    public ResponseEntity<ApiResponse<RecruiterSettingsResponseDto>>
    updateSettings(
            RecruiterSettingsUpdateDto request,
            Authentication authentication
    ) {

        try {

            User user = getCurrentUser(authentication);

            RecruiterSettings settings =
                    getOrCreateSettings(user);


            // ==============================
            // ACCOUNT INFORMATION
            // ==============================

            if (request.getRecruiterName() != null &&
                    !request.getRecruiterName().isBlank()) {

                user.setUserName(
                        request.getRecruiterName().trim()
                );
            }


            if (request.getEmail() != null &&
                    !request.getEmail().isBlank() &&
                    !request.getEmail()
                            .equalsIgnoreCase(user.getEmail())) {

                boolean emailExists =
                        userRepository
                                .findByEmailIgnoreCase(
                                        request.getEmail().trim()
                                )
                                .isPresent();

                if (emailExists) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    new ApiResponse<>(
                                            false,
                                            "Email is already registered",
                                            null
                                    )
                            );
                }

                user.setEmail(
                        request.getEmail().trim()
                );
            }


            if (request.getDesignation() != null &&
                    !request.getDesignation().isBlank()) {

                user.setDepartment(
                        request.getDesignation().trim()
                );
            }


            // ==============================
            // NOTIFICATION PREFERENCES
            // ==============================

            if (request.getEmailNotifications() != null) {

                settings.setEmailNotifications(
                        request.getEmailNotifications()
                );
            }

            if (request.getInterviewNotifications() != null) {

                settings.setInterviewNotifications(
                        request.getInterviewNotifications()
                );
            }

            if (request.getCandidateUpdates() != null) {

                settings.setCandidateUpdates(
                        request.getCandidateUpdates()
                );
            }


            // ==============================
            // APPEARANCE
            // ==============================

            if (request.getTheme() != null &&
                    !request.getTheme().isBlank()) {

                String theme =
                        request.getTheme()
                                .trim()
                                .toUpperCase();

                if (!theme.equals("LIGHT") &&
                        !theme.equals("DARK")) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    new ApiResponse<>(
                                            false,
                                            "Theme must be LIGHT or DARK",
                                            null
                                    )
                            );
                }

                settings.setTheme(theme);
            }


            userRepository.save(user);

            RecruiterSettings savedSettings =
                    settingsRepository.save(settings);


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Recruiter settings updated successfully",
                            buildResponse(
                                    user,
                                    savedSettings
                            )
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public ResponseEntity<ApiResponse<Void>>
    changePassword(
            ChangePasswordDto request,
            Authentication authentication
    ) {

        try {

            User user =
                    getCurrentUser(authentication);


            if (request.getCurrentPassword() == null ||
                    request.getCurrentPassword().isBlank()) {

                return badRequest(
                        "Current password is required"
                );
            }


            if (request.getNewPassword() == null ||
                    request.getNewPassword().isBlank()) {

                return badRequest(
                        "New password is required"
                );
            }


            if (!request.getNewPassword()
                    .equals(request.getConfirmPassword())) {

                return badRequest(
                        "New password and confirm password do not match"
                );
            }


            if (!passwordEncoder.matches(
                    request.getCurrentPassword(),
                    user.getPassword()
            )) {

                return badRequest(
                        "Current password is incorrect"
                );
            }


            if (passwordEncoder.matches(
                    request.getNewPassword(),
                    user.getPassword()
            )) {

                return badRequest(
                        "New password must be different from current password"
                );
            }


            user.setPassword(
                    passwordEncoder.encode(
                            request.getNewPassword()
                    )
            );

            userRepository.save(user);


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Password changed successfully",
                            null
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =====================================================
    // CURRENT USER
    // =====================================================

    private User getCurrentUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }


    // =====================================================
    // GET / CREATE DEFAULT SETTINGS
    // =====================================================

    private RecruiterSettings getOrCreateSettings(
            User user
    ) {

        return settingsRepository
                .findByUserId(user.getUserId())
                .orElseGet(() -> {

                    RecruiterSettings settings =
                            new RecruiterSettings();

                    settings.setUserId(
                            user.getUserId()
                    );

                    settings.setEmailNotifications(true);
                    settings.setInterviewNotifications(true);
                    settings.setCandidateUpdates(true);
                    settings.setTheme("LIGHT");

                    return settingsRepository
                            .save(settings);
                });
    }


    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private RecruiterSettingsResponseDto buildResponse(
            User user,
            RecruiterSettings settings
    ) {

        return new RecruiterSettingsResponseDto(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getDepartment(),
                settings.getEmailNotifications(),
                settings.getInterviewNotifications(),
                settings.getCandidateUpdates(),
                settings.getTheme()
        );
    }


    private ResponseEntity<ApiResponse<Void>>
    badRequest(String message) {

        return ResponseEntity
                .badRequest()
                .body(
                        new ApiResponse<>(
                                false,
                                message,
                                null
                        )
                );
    }
}