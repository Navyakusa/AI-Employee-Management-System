package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "performance_skill_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceSkillScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long performanceReviewId;

    @Column(nullable = false)
    private String skillName;

    @Column(nullable = false)
    private Double score;
}