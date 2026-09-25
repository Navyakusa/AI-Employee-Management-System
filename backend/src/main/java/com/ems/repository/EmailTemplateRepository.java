package com.ems.repository;

import com.ems.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository
        extends JpaRepository<EmailTemplate, Long> {

    Optional<EmailTemplate> findByTemplateCodeAndActiveTrue(
            String templateCode
    );

    Optional<EmailTemplate> findByTemplateCode(
            String templateCode
    );

    List<EmailTemplate> findAllByOrderByTemplateCodeAsc();
}