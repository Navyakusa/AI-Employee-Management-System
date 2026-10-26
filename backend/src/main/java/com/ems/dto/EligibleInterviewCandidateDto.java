
package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EligibleInterviewCandidateDto {

    private Long candidateId;

    private Long applicationId;

    private Long jobId;

    private String candidateName;

    private String jobTitle;

    private Double screeningScore;

    private String screeningResult;
}
