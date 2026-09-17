package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "recruiter_settings",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private Boolean emailNotifications;

    private Boolean interviewNotifications;

    private Boolean candidateUpdates;

    private String theme;

    @PrePersist
    public void prePersist() {

        if (emailNotifications == null) {
            emailNotifications = true;
        }

        if (interviewNotifications == null) {
            interviewNotifications = true;
        }

        if (candidateUpdates == null) {
            candidateUpdates = true;
        }

        if (theme == null || theme.isBlank()) {
            theme = "LIGHT";
        }
    }
}