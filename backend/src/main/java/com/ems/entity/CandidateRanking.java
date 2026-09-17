package com.ems.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class CandidateRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;

    private Long jobId;

    private Double matchScore;

    private Integer rank;
    private String candidateRole;

    private Double mustHaveCoveragePct;

    @Column(columnDefinition = "TEXT")
    private String missingMustHave;
}