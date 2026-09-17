package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "screening_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    private String category;

    private Long jobId;

    private String difficulty;

    private Boolean active;

    private String source;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {

        if (active == null) {
            active = true;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}