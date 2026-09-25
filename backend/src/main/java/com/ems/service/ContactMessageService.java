package com.ems.service;

import com.ems.entity.ContactMessage;
import com.ems.entity.ContactMessageStatus;
import com.ems.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    private final EmailNotificationService emailNotificationService;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository,
            EmailNotificationService emailNotificationService) {

        this.contactMessageRepository =
                contactMessageRepository;

        this.emailNotificationService =
                emailNotificationService;
    }

    // =================================================
    // CREATE CONTACT MESSAGE
    // =================================================

    public ContactMessage createMessage(ContactMessage message) {

        message.setId(null);
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());

        // Every new message starts as NEW
        message.setStatus(ContactMessageStatus.NEW);

        // No resolution when message is created
        message.setResolution(null);
        message.setResolvedAt(null);

        return contactMessageRepository.save(message);
    }

    // =================================================
    // GET ALL CONTACT MESSAGES
    // =================================================

    public List<ContactMessage> getAllMessages() {

        return contactMessageRepository
                .findAllByOrderByCreatedAtDesc();
    }

    // =================================================
    // GET MESSAGE BY ID
    // =================================================

    public ContactMessage getMessageById(Long id) {

        return contactMessageRepository
                .findById(id)
                .orElse(null);
    }

    // =================================================
    // MARK MESSAGE AS READ
    // =================================================

    public ContactMessage markAsRead(Long id) {

        ContactMessage message =
                contactMessageRepository.findById(id)
                        .orElse(null);

        if (message == null) {
            return null;
        }

        message.setRead(true);

        return contactMessageRepository.save(message);
    }

    // =================================================
    // GET UNREAD COUNT
    // =================================================

    public long getUnreadCount() {

        return contactMessageRepository
                .countByReadFalse();
    }

    // =================================================
    // UPDATE MESSAGE STATUS
    // =================================================

    public ContactMessage updateStatus(
            Long id,
            ContactMessageStatus status) {

        ContactMessage message =
                contactMessageRepository.findById(id)
                        .orElse(null);

        if (message == null) {
            return null;
        }

        message.setStatus(status);

        if (status == ContactMessageStatus.RESOLVED) {

            message.setResolvedAt(LocalDateTime.now());

        } else {

            message.setResolvedAt(null);
        }

        return contactMessageRepository.save(message);
    }

    // =================================================
    // RESOLVE / REPLY TO MESSAGE
    // =================================================

    public ContactMessage resolveMessage(
            Long id,
            String resolution) {

        ContactMessage message =
                contactMessageRepository.findById(id)
                        .orElse(null);

        if (message == null) {
            return null;
        }

        if (resolution == null || resolution.isBlank()) {

            throw new IllegalArgumentException(
                    "Resolution/reply cannot be empty"
            );
        }

        // Save admin's reply
        message.setResolution(resolution);

        // Mark as resolved
        message.setStatus(ContactMessageStatus.RESOLVED);

        // Store resolution time
        message.setResolvedAt(LocalDateTime.now());

        // Resolved message is considered read
        message.setRead(true);

        // Save first
        ContactMessage savedMessage =
                contactMessageRepository.save(message);

        // Send response to the email submitted
        // with the original contact message
        emailNotificationService
                .sendContactMessageResolutionEmail(
                        savedMessage.getEmail(),
                        savedMessage.getFullName(),
                        savedMessage.getSubject(),
                        savedMessage.getResolution()
                );

        return savedMessage;
    }
}