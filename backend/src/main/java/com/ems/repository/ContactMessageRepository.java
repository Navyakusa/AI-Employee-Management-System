package com.ems.repository;

import com.ems.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    List<ContactMessage> findByStatus(String status);

    long countByReadFalse();
}