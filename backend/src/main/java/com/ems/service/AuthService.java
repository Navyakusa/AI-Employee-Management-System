package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AuthResponseDto;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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

            boolean passwordMatches =
                    passwordEncoder.matches(
                            loginDto.getPassword(),
                            user.getPassword()
                    );

            if (!passwordMatches) {

                throw new InvalidCredentialsException(
                        "Invalid email or password"
                );
            }

            // Check whether account is active
            if (Boolean.FALSE.equals(user.getActive())) {

                throw new InvalidCredentialsException(
                        "Your account is inactive"
                );
            }

            // Get role from database
            String token =
                    jwtService.generateToken(
                            user.getEmail(),
                            user.getRole()
                    );

            AuthResponseDto authResponse =
                    new AuthResponseDto(
                            user.getUserId(),
                            user.getUserName(),
                            user.getEmail(),
                            user.getRole(),
                            token
                    );

            ApiResponse<AuthResponseDto> response =
                    new ApiResponse<>(
                            true,
                            "Login successful",
                            authResponse
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (InvalidCredentialsException e) {

            ApiResponse<AuthResponseDto> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.UNAUTHORIZED
            );
        }
    }


    // =========================================================
    // SIGNUP
    // =========================================================

    // =========================================================
// SIGNUP
// =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<User>> signup(
            SignupDto signupDto) {

        try {

            boolean emailExists =
                    userRepository
                            .findByEmailIgnoreCase(
                                    signupDto.getEmail()
                            )
                            .isPresent();

            if (emailExists) {

                ApiResponse<User> response =
                        new ApiResponse<>(
                                false,
                                "Email already registered",
                                null
                        );

                return new ResponseEntity<>(
                        response,
                        HttpStatus.CONFLICT
                );
            }

            // =================================================
            // CREATE USER
            // =================================================

            User user = new User();

            user.setUserName(
                    signupDto.getUserName()
            );

            user.setEmail(
                    signupDto.getEmail()
            );

            user.setPassword(
                    passwordEncoder.encode(
                            signupDto.getPassword()
                    )
            );

            // =================================================
            // PUBLIC SIGNUP ALWAYS CREATES CANDIDATE
            // Do NOT take role from frontend
            // =================================================

            user.setRole("CANDIDATE");

            user.setDepartment(
                    signupDto.getDepartment()
            );

            user.setActive(true);

            User savedUser =
                    userRepository.save(user);

            // =================================================
            // CREATE CANDIDATE PROFILE
            // =================================================

            Candidate candidate =
                    new Candidate();

            candidate.setName(
                    signupDto.getUserName()
            );

            candidate.setEmail(
                    signupDto.getEmail()
            );

            candidate.setStatus(
                    "ACTIVE"
            );

            candidate.setApplicationDate(
                    LocalDateTime.now()
            );

            candidate.setSource(
                    "SIGNUP"
            );

            candidateRepository.save(candidate);

            // =================================================
            // RESPONSE
            // =================================================

            ApiResponse<User> response =
                    new ApiResponse<>(
                            true,
                            "User registered successfully",
                            savedUser
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.CREATED
            );

        } catch (Exception e) {

            e.printStackTrace();

            ApiResponse<User> response =
                    new ApiResponse<>(
                            false,
                            "Registration failed: "
                                    + e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.INTERNAL_SERVER_ERROR
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

            String email =
                    request.getEmail()
                            .trim()
                            .toLowerCase();

            User user =
                    userRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            /*
             * Do not reveal whether an email exists.
             */
            if (user == null) {

                return ResponseEntity.ok(
                        new ApiResponse<>(
                                true,
                                "If the email is registered, "
                                        + "password reset instructions "
                                        + "have been sent",
                                null
                        )
                );
            }

            // Delete old reset tokens
            passwordResetTokenRepository
                    .deleteByUserId(
                            user.getUserId()
                    );

            // Generate reset token
            String resetToken =
                    java.util.UUID.randomUUID().toString();

            PasswordResetToken passwordResetToken =
                    new PasswordResetToken();

            passwordResetToken.setToken(
                    resetToken
            );

            passwordResetToken.setUserId(
                    user.getUserId()
            );

            passwordResetToken.setExpiryDate(
                    LocalDateTime.now()
                            .plusMinutes(30)
            );

            passwordResetToken.setUsed(false);

            passwordResetTokenRepository.save(
                    passwordResetToken
            );

            // Send reset email
            emailNotificationService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getUserName(),
                    resetToken
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "If the email is registered, "
                                    + "password reset instructions "
                                    + "have been sent",
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
                            .findByToken(
                                    request.getToken()
                            )
                            .orElse(null);

            // Token does not exist
            if (resetToken == null) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Invalid password reset token",
                                        null
                                )
                        );
            }

            // Token already used
            if (resetToken.isUsed()) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Password reset token has already been used",
                                        null
                                )
                        );
            }

            // Token expired
            if (resetToken.getExpiryDate()
                    .isBefore(LocalDateTime.now())) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Password reset token has expired",
                                        null
                                )
                        );
            }

            // Find user
            User user =
                    userRepository
                            .findById(
                                    resetToken.getUserId()
                            )
                            .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User account not found",
                                        null
                                )
                        );
            }

            // Encode new password
            user.setPassword(
                    passwordEncoder.encode(
                            request.getNewPassword()
                    )
            );

            userRepository.save(user);

            // Mark token as used
            resetToken.setUsed(true);

            passwordResetTokenRepository.save(
                    resetToken
            );

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
}