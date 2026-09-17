package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.NotificationStatsDto;
import com.ems.entity.Notification;
import com.ems.entity.User;
import com.ems.repository.NotificationRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    // =========================
// GET UNREAD COUNT
// =========================

    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            long unreadCount =
                    notificationRepository
                            .countByUserIdAndReadStatusFalse(
                                    user.getUserId()
                            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Unread notification count fetched successfully",
                            unreadCount
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


// =========================
// MARK ALL AS READ
// =========================

    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            List<Notification> unreadNotifications =
                    notificationRepository
                            .findByUserIdAndReadStatusFalse(
                                    user.getUserId()
                            );

            unreadNotifications.forEach(
                    notification ->
                            notification.setReadStatus(true)
            );

            notificationRepository.saveAll(
                    unreadNotifications
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "All notifications marked as read",
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

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }


    // =========================
    // CREATE NOTIFICATION
    // =========================

    public Notification createNotification(
            Long userId,
            String message,
            String type) {

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }


    // =========================
    // GET MY NOTIFICATIONS
    // =========================

    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            List<Notification> notifications =
                    notificationRepository
                            .findByUserIdOrderByCreatedAtDesc(
                                    user.getUserId()
                            );

            ApiResponse<List<Notification>> response =
                    new ApiResponse<>(
                            true,
                            "Notifications fetched successfully",
                            notifications
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Notification>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // =========================
    // MARK NOTIFICATION AS READ
    // =========================

    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            Long notificationId,
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            Notification notification =
                    notificationRepository
                            .findById(notificationId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Notification not found"
                                    )
                            );

            // User can mark only their own notification
            if (!notification.getUserId()
                    .equals(user.getUserId())) {

                ApiResponse<Notification> response =
                        new ApiResponse<>(
                                false,
                                "You are not allowed to access this notification",
                                null
                        );

                return new ResponseEntity<>(
                        response,
                        HttpStatus.FORBIDDEN
                );
            }

            notification.setReadStatus(true);

            Notification updatedNotification =
                    notificationRepository.save(notification);

            ApiResponse<Notification> response =
                    new ApiResponse<>(
                            true,
                            "Notification marked as read",
                            updatedNotification
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Notification> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }
    public ResponseEntity<ApiResponse<NotificationStatsDto>>
    getNotificationStats(Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            long total =
                    notificationRepository
                            .countByUserId(
                                    user.getUserId()
                            );

            long unread =
                    notificationRepository
                            .countByUserIdAndReadStatusFalse(
                                    user.getUserId()
                            );

            NotificationStatsDto stats =
                    new NotificationStatsDto(
                            total,
                            unread
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Notification statistics fetched successfully",
                            stats
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
    public ResponseEntity<ApiResponse<Void>>
    deleteNotification(
            Long notificationId,
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            Notification notification =
                    notificationRepository
                            .findById(notificationId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Notification not found"
                                    )
                            );

            // User can delete only their own notification
            if (!notification.getUserId()
                    .equals(user.getUserId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to delete this notification",
                                        null
                                )
                        );
            }

            notificationRepository
                    .delete(notification);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Notification deleted successfully",
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
}