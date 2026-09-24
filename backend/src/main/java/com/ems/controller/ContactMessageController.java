package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.entity.ContactMessage;
import com.ems.service.ContactMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(
            ContactMessageService contactMessageService) {

        this.contactMessageService =
                contactMessageService;
    }

    // Public contact form submission
    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ContactMessage>> createMessage(
            @RequestBody ContactMessage message) {

        ContactMessage savedMessage =
                contactMessageService.createMessage(message);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Message sent successfully",
                        savedMessage
                )
        );
    }

    // HR can see all contact messages
    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<ContactMessage>>> getAllMessages() {

        List<ContactMessage> messages =
                contactMessageService.getAllMessages();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Contact messages retrieved successfully",
                        messages
                )
        );
    }

    // HR can view one message
    @GetMapping("/messages/{id}")
    public ResponseEntity<ApiResponse<ContactMessage>> getMessage(
            @PathVariable Long id) {

        ContactMessage message =
                contactMessageService.getMessageById(id);

        if (message == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Contact message retrieved successfully",
                        message
                )
        );
    }

    // HR can mark message as read
    @PutMapping("/messages/{id}/read")
    public ResponseEntity<ApiResponse<ContactMessage>> markAsRead(
            @PathVariable Long id) {

        ContactMessage message =
                contactMessageService.markAsRead(id);

        if (message == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Message marked as read",
                        message
                )
        );
    }

    // HR unread count
    @GetMapping("/messages/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {

        long count =
                contactMessageService.getUnreadCount();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Unread message count retrieved successfully",
                        count
                )
        );
    }
}