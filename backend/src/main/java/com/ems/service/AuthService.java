
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AuthResponseDto;
import com.ems.dto.ChangePasswordDto;
import com.ems.dto.ForgotPasswordRequestDto;
import com.ems.dto.LoginDto;
import com.ems.dto.ResetPasswordRequestDto;
import com.ems.dto.SignupDto;
import com.ems.entity.Candidate;
import com.ems.entity.PasswordResetToken;
import com.ems.entity.User;
import com.ems.exception.InvalidCredentialsException;
import com.ems.repository.CandidateRepository;
import com.ems.repository.PasswordResetTokenRepository;
import com.ems.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private CandidateRepository candidateRepository;

    // =========================================================
    // LOGIN
    // =========================================================

    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            LoginDto loginDto) {

        try {
            User user = userRepository
                    .findByEmailIgnoreCase(loginDto.getEmail())
                    .orElseThrow(() ->
                            new InvalidCredentialsException(
                                    "Invalid email or password"
                            )
                    );

            boolean passwordMatches = passwordEncoder.matches(
                    loginDto.getPassword(),
                    user.getPassword()
            );

            if (!passwordMatches) {
                throw new InvalidCredentialsException(
                        "Invalid email or password"
                );
            }

            if (Boolean.FALSE.equals(user.getActive())) {
                throw new InvalidCredentialsException(
                        "Your account is inactive"
                );
            }

            String token = jwtService.generateToken(
                    user.getUserId(),
                    user.getUserName(),
                    user.getEmail(),
                    user.getRole()
            );

            AuthResponseDto authResponse = new AuthResponseDto(token);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Login successful",
                            authResponse
                    )
            );

        } catch (InvalidCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // SIGNUP
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<User>> signup(
            SignupDto signupDto) {

        try {
            boolean emailExists = userRepository
                    .findByEmailIgnoreCase(signupDto.getEmail())
                    .isPresent();

            if (emailExists) {
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

            User user = new User();
            user.setUserName(signupDto.getUserName());
            user.setEmail(signupDto.getEmail());
            user.setPassword(
                    passwordEncoder.encode(signupDto.getPassword())
            );

            // Public signup creates a candidate account.
            user.setRole("CANDIDATE");
            user.setDepartment(signupDto.getDepartment());
            user.setActive(true);

            User savedUser = userRepository.save(user);

            Candidate candidate = new Candidate();
            candidate.setName(signupDto.getUserName());
            candidate.setEmail(signupDto.getEmail());
            candidate.setStatus("ACTIVE");
            candidate.setApplicationDate(LocalDateTime.now());
            candidate.setSource("SIGNUP");

            candidateRepository.save(candidate);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "User registered successfully",
                                    savedUser
                            )
                    );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Registration failed: " + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            ForgotPasswordRequestDto request) {

        try {
            String email = request.getEmail()
                    .trim()
                    .toLowerCase();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            // Do not reveal whether an email is registered.
            if (user == null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(
                                true,
                                "If the email is registered, password reset instructions have been sent",
                                null
                        )
                );
            }

            passwordResetTokenRepository.deleteByUserId(
                    user.getUserId()
            );

            String resetToken = UUID.randomUUID().toString();

            PasswordResetToken passwordResetToken =
                    new PasswordResetToken();

            passwordResetToken.setToken(resetToken);
            passwordResetToken.setUserId(user.getUserId());
            passwordResetToken.setExpiryDate(
                    LocalDateTime.now().plusMinutes(30)
            );
            passwordResetToken.setUsed(false);

            passwordResetTokenRepository.save(passwordResetToken);

            emailNotificationService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getUserName(),
                    resetToken
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "If the email is registered, password reset instructions have been sent",
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
                                    "Failed to process password reset request",
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            ResetPasswordRequestDto request) {

        try {
            PasswordResetToken resetToken =
                    passwordResetTokenRepository
                            .findByToken(request.getToken())
                            .orElse(null);

            if (resetToken == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Invalid password reset token",
                                        null
                                )
                        );
            }

            if (resetToken.isUsed()) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Password reset token has already been used",
                                        null
                                )
                        );
            }

            if (resetToken.getExpiryDate()
                    .isBefore(LocalDateTime.now())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Password reset token has expired",
                                        null
                                )
                        );
            }

            User user = userRepository
                    .findById(resetToken.getUserId())
                    .orElse(null);

            if (user == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User account not found",
                                        null
                                )
                        );
            }

            user.setPassword(
                    passwordEncoder.encode(request.getNewPassword())
            );
            userRepository.save(user);

            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Password reset successfully",
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
                                    "Failed to reset password",
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(
            ChangePasswordDto request,
            Authentication authentication) {

        // 1. Verify authentication
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Authentication is required",
                                    null
                            )
                    );
        }

        // 2. Validate request fields
        if (request == null
                || request.getCurrentPassword() == null
                || request.getNewPassword() == null
                || request.getConfirmPassword() == null
                || request.getCurrentPassword().isBlank()
                || request.getNewPassword().isBlank()
                || request.getConfirmPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "All password fields are required",
                                    null
                            )
                    );
        }

        // 3. Check password confirmation
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "New password and confirmation do not match",
                                    null
                            )
                    );
        }

        // 4. Ensure the new password differs from the current password
        if (request.getCurrentPassword()
                .equals(request.getNewPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "New password must differ from current password",
                                    null
                            )
                    );
        }

        // 5. Find the authenticated user
        User user = userRepository
                .findByEmailIgnoreCase(authentication.getName())
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

        // 6. Verify the current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Current password is incorrect",
                                    null
                            )
                    );
        }

        // 7. Encode and save the new password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        // 8. Return success
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Password changed successfully",
                        null
                )
        );
    }
}
