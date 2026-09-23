package com.ems.repository;

import com.ems.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // =========================================================
    // GET ALL NOTIFICATIONS FOR USER
    // =========================================================

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    long countByUserIdAndReadStatusFalse(
            Long userId
    );

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    List<Notification> findByUserIdAndReadStatusFalse(
            Long userId
    );

    // =========================================================
    // GET TOTAL COUNT
    // =========================================================

    long countByUserId(
            Long userId
    );

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
            UPDATE Notification n
            SET n.readStatus = true
            WHERE n.notificationId = :notificationId
              AND n.userId = :userId
            """)
    int markAsRead(
            @Param("notificationId") Long notificationId,
            @Param("userId") Long userId
    );

    // =========================================================
    // MARK ALL USER NOTIFICATIONS AS READ
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
            UPDATE Notification n
            SET n.readStatus = true
            WHERE n.userId = :userId
              AND (n.readStatus = false OR n.readStatus IS NULL)
            """)
    int markAllAsRead(
            @Param("userId") Long userId
    );
}