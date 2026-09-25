package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.entity.ContactMessage;
import com.ems.entity.ContactMessageStatus;
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

    // =================================================
    // PUBLIC CONTACT FORM SUBMISSION
    // =================================================

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

    // =================================================
    // GET ALL CONTACT MESSAGES
    // =================================================

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

    // =================================================
    // GET MESSAGE BY ID
    // =================================================

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

    // =================================================
    // MARK MESSAGE AS READ
    // =================================================

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

    // =================================================
    // GET UNREAD COUNT
    // =================================================

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

    // =================================================
    // UPDATE MESSAGE STATUS
    // =================================================

    @PutMapping("/messages/{id}/status")
    public ResponseEntity<ApiResponse<ContactMessage>> updateStatus(
            @PathVariable Long id,
            @RequestParam ContactMessageStatus status) {

        ContactMessage message =
                contactMessageService.updateStatus(
                        id,
                        status
                );

        if (message == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Contact message status updated successfully",
                        message
                )
        );
    }

    // =================================================
    // RESOLVE / REPLY TO MESSAGE
    // =================================================

    @PutMapping("/messages/{id}/resolve")
    public ResponseEntity<ApiResponse<ContactMessage>> resolveMessage(
            @PathVariable Long id,
            @RequestBody ResolveMessageRequest request) {

        ContactMessage message =
                contactMessageService.resolveMessage(
                        id,
                        request.getResolution()
                );

        if (message == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Contact message resolved and reply sent successfully",
                        message
                )
        );
    }

    // =================================================
    // RESOLUTION REQUEST DTO
    // =================================================

    public static class ResolveMessageRequest {

        private String resolution;

        public String getResolution() {
            return resolution;
        }

        public void setResolution(String resolution) {
            this.resolution = resolution;
        }
    }
}