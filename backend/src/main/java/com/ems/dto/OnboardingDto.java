package com.ems.dto;

import com.ems.common.OnboardingStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingDto {

    private Long onboardingId;

    private Long offerId;

    private Long candidateId;

    private String candidateName;

    private String position;

    private OnboardingStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
}