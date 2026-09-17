package com.ems.repository;

import com.ems.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    long countByUserIdAndReadStatusFalse(
            Long userId
    );

    List<Notification> findByUserIdAndReadStatusFalse(
            Long userId
    );

    long countByUserId(Long userId);
}