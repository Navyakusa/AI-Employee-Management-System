package com.ems.repository;

import com.ems.entity.Onboarding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OnboardingRepository
        extends JpaRepository<Onboarding, Long> {

    boolean existsByOfferId(Long offerId);

    Optional<Onboarding> findByOfferId(Long offerId);

    List<Onboarding> findByCandidateId(Long candidateId);
}