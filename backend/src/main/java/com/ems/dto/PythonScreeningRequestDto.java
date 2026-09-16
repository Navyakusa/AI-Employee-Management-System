
package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonScreeningRequestDto {

    private PythonScreeningJobDto job;

    @JsonProperty("resume_text")
    private String resumeText;
}