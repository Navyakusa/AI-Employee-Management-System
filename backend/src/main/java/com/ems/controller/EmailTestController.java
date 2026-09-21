package com.ems.controller;

import com.ems.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-test")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmailTestController {

    private final EmailNotificationService emailNotificationService;

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to
    ) {

        emailNotificationService.sendTestEmail(to);

        return ResponseEntity.ok("Test email sent successfully");
    }
}