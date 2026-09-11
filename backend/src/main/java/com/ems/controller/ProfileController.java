package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.entity.User;
import com.ems.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<User>> getProfile() {

        return profileService.getProfile();
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestParam String userName,
            @RequestParam String email,
            @RequestParam String department
    ) {

        return profileService.updateProfile(
                userName,
                email,
                department
        );
    }
}