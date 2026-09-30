package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.NotificationStatsDto;
import com.ems.entity.Notification;
import com.ems.entity.User;
import com.ems.repository.NotificationRepository;
import com.ems.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;
    private final NotificationSseService notificationSseService;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            EmailNotificationService emailNotificationService,
            NotificationSseService notificationSseService
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
        this.notificationSseService = notificationSseService;
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

        Notification notification =
                Notification.builder()
                        .userId(userId)
                        .message(message)
                        .type(type)
                        .readStatus(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        // =====================================================
        // SEND EMAIL + SSE AFTER TRANSACTION COMMIT
        // =====================================================

        Runnable notificationTask = () -> {

            // -------------------------------------------------
            // SSE
            // -------------------------------------------------

            try {

                notificationSseService.sendNotification(
                        userId,
                        savedNotification
                );

                log.info(
                        "SSE notification sent for notification ID: {}",
                        savedNotification.getNotificationId()
                );

            } catch (Exception e) {

                log.error(
                        "SSE notification failed for notification ID: {}",
                        savedNotification.getNotificationId(),
                        e
                );
            }

            // -------------------------------------------------
            // EMAIL
            // -------------------------------------------------

            try {

                boolean sent =
                        emailNotificationService.sendEmail(
                                userId,
                                type,
                                Map.of()
                        );

                if (sent) {

                    log.info(
                            "Email submitted for notification ID: {}",
                            savedNotification.getNotificationId()
                    );
                }

            } catch (Exception e) {

                log.error(
                        "Email notification failed for notification ID: {}",
                        savedNotification.getNotificationId(),
                        e
                );
            }
        };

        if (TransactionSynchronizationManager
                .isActualTransactionActive()
                && TransactionSynchronizationManager
                .isSynchronizationActive()) {

            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {

                                @Override
                                public void afterCommit() {

                                    notificationTask.run();
                                }
                            }
                    );

        } else {

            notificationTask.run();
        }

        return savedNotification;
    }

    // =========================================================
    // GET USER ID BY EMAIL
    // Used by SSE connection
    // =========================================================

    public Long getUserIdByEmail(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return user.getUserId();
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

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Notifications fetched successfully",
                            notifications
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
            // =================================================

            if (!notification.getUserId()
                    .equals(user.getUserId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to access this notification",
                                        null
                                )
                        );
            }

            // =================================================
            // DATABASE UPDATE
            // =================================================

            int updatedCount =
                    notificationRepository.markAsRead(
                            notificationId,
                            user.getUserId()
                    );

            if (updatedCount == 0) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Notification could not be marked as read",
                                        null
                                )
                        );
            }

            notification.setReadStatus(true);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Notification marked as read",
                            notification
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

            // =================================================
            // SECURITY CHECK
            // =================================================

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