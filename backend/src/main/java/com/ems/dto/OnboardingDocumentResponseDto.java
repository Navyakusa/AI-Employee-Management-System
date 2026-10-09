
package com.ems.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingDocumentResponseDto {

    private Long id;

    private Long onboardingId;

    private Long candidateId;

    private String documentType;

    private String fileName;

    private String fileType;

    private String status;

    private String rejectionReason;

    private String verifiedBy;

    private LocalDateTime uploadedAt;

    private LocalDateTime verifiedAt;
}
