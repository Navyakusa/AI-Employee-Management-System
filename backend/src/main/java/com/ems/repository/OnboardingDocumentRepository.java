
package com.ems.repository;

import com.ems.entity.OnboardingDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnboardingDocumentRepository
        extends JpaRepository<OnboardingDocument, Long> {

    List<OnboardingDocument> findByOnboardingId(Long onboardingId);

    List<OnboardingDocument> findByCandidateId(Long candidateId);

    long countByOnboardingIdAndStatusIgnoreCase(
            Long onboardingId,
            String status
    );
}
