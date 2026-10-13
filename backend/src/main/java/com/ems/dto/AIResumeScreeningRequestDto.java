
package com.ems.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AIResumeScreeningRequestDto {

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    @NotNull(message = "Job ID is required")
    private Long jobId;

    // Pass the exact resume and application to be screened.
    private Long resumeId;

    private Long applicationId;
}
