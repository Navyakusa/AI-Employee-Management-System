package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonRankingRequestDto {

    private PythonRankingJobDto job;

    private List<PythonRankingCandidateDto> candidates;

    @JsonProperty("top_n")
    private Integer topN;
}