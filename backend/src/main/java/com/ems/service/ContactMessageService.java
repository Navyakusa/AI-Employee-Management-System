package com.ems.service;

import com.ems.entity.ContactMessage;
import com.ems.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository) {

        this.contactMessageRepository =
                contactMessageRepository;
    }

    public ContactMessage createMessage(ContactMessage message) {

        message.setId(null);
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());

        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {

        return contactMessageRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public ContactMessage getMessageById(Long id) {

        return contactMessageRepository
                .findById(id)
                .orElse(null);
    }

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

    public long getUnreadCount() {

        return contactMessageRepository
                .countByReadFalse();
    }
}