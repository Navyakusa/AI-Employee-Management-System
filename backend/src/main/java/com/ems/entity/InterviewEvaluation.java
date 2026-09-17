package com.ems.entity;

import com.ems.common.EvaluationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long evaluationId;

    @Column(nullable = false)
    private Long interviewId;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long interviewerId;

    private Integer technicalSkills;

    private Integer communication;

    private Integer problemSolving;

    private Double overallRating;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String areasForImprovement;

    @Enumerated(EnumType.STRING)
    private EvaluationStatus status;

    private LocalDateTime submittedAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = EvaluationStatus.DRAFT;
        }
    }
}