package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.AuthResponseDto;
import com.ems.dto.ChangePasswordDto;
import com.ems.dto.ForgotPasswordRequestDto;
import com.ems.dto.LoginDto;
import com.ems.dto.ResetPasswordRequestDto;
import com.ems.dto.SignupDto;
import com.ems.entity.User;
import com.ems.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            @RequestBody LoginDto loginDto) {

        return authService.login(loginDto);
    }

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(
            @RequestBody SignupDto signupDto) {

        return authService.signup(signupDto);
    }

    // FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request) {

        return authService.forgotPassword(request);
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto request) {

        return authService.resetPassword(request);
    }

    // CHANGE PASSWORD - AUTHENTICATED USER
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordDto request,
            Authentication authentication) {

        return authService.changePassword(request, authentication);
    }
}