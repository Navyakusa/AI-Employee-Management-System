package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ResumeResponseDto {

    private Long id;
    private Long candidateId;

    private String fileName;
    private String fileType;
    private String filePath;

    private String extractedText;
    private String extractedSkills;
    private String extractedExperience;
    private String extractedEducation;

    private LocalDateTime uploadedAt;
}