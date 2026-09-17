package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.NotificationStatsDto;
import com.ems.entity.Notification;
import com.ems.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    // =========================
    // GET MY NOTIFICATIONS
    // =========================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Notification>>>
    getMyNotifications(
            Authentication authentication
    ) {

        return notificationService
                .getMyNotifications(
                        authentication
                );
    }

    // =========================
    // GET UNREAD COUNT
    // =========================

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>>
    getUnreadCount(
            Authentication authentication
    ) {

        return notificationService
                .getUnreadCount(
                        authentication
                );
    }

    // =========================
    // MARK ONE AS READ
    // =========================

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Notification>>
    markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {

        return notificationService
                .markAsRead(
                        notificationId,
                        authentication
                );
    }

    // =========================
    // MARK ALL AS READ
    // =========================

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>>
    markAllAsRead(
            Authentication authentication
    ) {

        return notificationService
                .markAllAsRead(
                        authentication
                );
    }
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<NotificationStatsDto>>
    getNotificationStats(
            Authentication authentication
    ) {

        return notificationService
                .getNotificationStats(authentication);
    }
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteNotification(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {

        return notificationService
                .deleteNotification(
                        notificationId,
                        authentication
                );
    }
}