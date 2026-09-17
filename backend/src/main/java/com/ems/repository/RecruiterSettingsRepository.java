package com.ems.repository;

import com.ems.entity.RecruiterSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecruiterSettingsRepository
        extends JpaRepository<RecruiterSettings, Long> {

    Optional<RecruiterSettings> findByUserId(Long userId);
}