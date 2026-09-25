package com.ems.entity;

import com.ems.common.OnboardingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "onboarding",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_onboarding_offer",
                        columnNames = "offer_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Onboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long onboardingId;

    @Column(name = "offer_id", nullable = false)
    private Long offerId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    private String candidateName;

    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OnboardingStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {

        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = OnboardingStatus.STARTED;
        }
    }
}