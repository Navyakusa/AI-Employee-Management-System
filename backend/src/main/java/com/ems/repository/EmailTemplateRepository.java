package com.ems.repository;

import com.ems.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailTemplateRepository
        extends JpaRepository<EmailTemplate, Long> {

    Optional<EmailTemplate> findByTemplateCodeAndActiveTrue(
            String templateCode
    );
}