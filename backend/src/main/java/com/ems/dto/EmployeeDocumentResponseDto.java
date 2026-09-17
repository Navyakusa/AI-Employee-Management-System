
package com.ems.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocumentResponseDto {

    private Long id;

    private Long employeeId;

    private String documentType;

    private String documentName;

    private String fileName;

    private String fileType;

    private String status;

    private LocalDateTime uploadedAt;
}