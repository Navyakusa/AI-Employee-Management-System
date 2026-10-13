
package com.ems.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ResumeRequestDto {

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    // Optional for older upload flows; validate it in the service
    // whenever the client supplies an application ID.
    private Long applicationId;

    @NotNull(message = "Resume file is required")
    private MultipartFile file;
}
