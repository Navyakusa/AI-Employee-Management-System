package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String documentType;

    @Column(nullable = false)
    private String documentName;

    private String fileName;

    private String fileType;

    @Column(columnDefinition = "TEXT")
    private String filePath;

    @Column(nullable = false)
    private String status;

    private LocalDateTime uploadedAt;
}