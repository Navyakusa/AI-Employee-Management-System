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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication authentication
    ) {

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

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            int updatedCount =
                    notificationRepository.markAllAsRead(
                            user.getUserId()
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

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    public Notification createNotification(
            Long userId,
            String message,
            String type
    ) {

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    public ResponseEntity<ApiResponse<List<Notification>>>
    getMyNotifications(
            Authentication authentication
    ) {

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

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
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

            // =================================================
            // SECURITY CHECK
            // User can only modify their own notification
            // =================================================

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

            // =================================================
            // EXPLICIT DATABASE UPDATE
            // =================================================

            int updatedCount =
                    notificationRepository.markAsRead(
                            notificationId,
                            user.getUserId()
                    );

            if (updatedCount == 0) {

                ApiResponse<Notification> response =
                        new ApiResponse<>(
                                false,
                                "Notification could not be marked as read",
                                null
                        );

                return new ResponseEntity<>(
                        response,
                        HttpStatus.BAD_REQUEST
                );
            }

            // Keep returned object consistent with database
            notification.setReadStatus(true);

            ApiResponse<Notification> response =
                    new ApiResponse<>(
                            true,
                            "Notification marked as read",
                            notification
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

    // =========================================================
    // NOTIFICATION STATS
    // =========================================================

    public ResponseEntity<ApiResponse<NotificationStatsDto>>
    getNotificationStats(
            Authentication authentication
    ) {

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

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

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

            notificationRepository.delete(notification);

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