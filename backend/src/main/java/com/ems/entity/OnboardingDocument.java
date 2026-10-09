
package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "onboarding_id", nullable = false)
    private Long onboardingId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    private String fileName;

    private String fileType;

    @Column(columnDefinition = "TEXT")
    private String filePath;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private String verifiedBy;

    private LocalDateTime uploadedAt;

    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = "PENDING";
        }
    }
}
