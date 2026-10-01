package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.NotificationStatsDto;
import com.ems.entity.Notification;
import com.ems.service.NotificationService;
import com.ems.service.NotificationSseService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationSseService notificationSseService;

    public NotificationController(
            NotificationService notificationService,
            NotificationSseService notificationSseService
    ) {
        this.notificationService = notificationService;
        this.notificationSseService = notificationSseService;
    }


    // =========================================================
    // SSE NOTIFICATION STREAM
    // =========================================================

    @GetMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter streamNotifications(
            Authentication authentication
    ) {

        System.out.println("=================================");
        System.out.println("SSE REQUEST RECEIVED");
        System.out.println("=================================");

        if (authentication == null) {

            System.out.println(
                    "SSE AUTHENTICATION = NULL"
            );

            throw new RuntimeException(
                    "Authentication is required for notification stream"
            );
        }

        String email = authentication.getName();

        System.out.println(
                "SSE AUTHENTICATED EMAIL = "
                        + email
        );


        // =====================================================
        // GET USER ID
        // =====================================================

        Long userId =
                notificationService.getUserIdByEmail(email);

        System.out.println(
                "SSE USER ID = "
                        + userId
        );


        if (userId == null) {

            throw new RuntimeException(
                    "User ID not found for email: "
                            + email
            );
        }


        // =====================================================
        // CREATE SSE CONNECTION
        // =====================================================

        System.out.println(
                "CALLING notificationSseService.connect()"
        );

        SseEmitter emitter =
                notificationSseService.connect(userId);

        System.out.println(
                "notificationSseService.connect() COMPLETED"
        );

        System.out.println(
                "SSE STREAM RETURNING TO CLIENT"
        );

        System.out.println("=================================");

        return emitter;
    }


    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Notification>>>
    getMyNotifications(
            Authentication authentication
    ) {

        return notificationService
                .getMyNotifications(authentication);
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>>
    getUnreadCount(
            Authentication authentication
    ) {

        return notificationService
                .getUnreadCount(authentication);
    }


    // =========================================================
    // MARK ONE AS READ
    // =========================================================

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


    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>>
    markAllAsRead(
            Authentication authentication
    ) {

        return notificationService
                .markAllAsRead(authentication);
    }


    // =========================================================
    // NOTIFICATION STATS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<NotificationStatsDto>>
    getNotificationStats(
            Authentication authentication
    ) {

        return notificationService
                .getNotificationStats(authentication);
    }


    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

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