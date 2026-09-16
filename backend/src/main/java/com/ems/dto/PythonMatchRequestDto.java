package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonMatchRequestDto {

    private PythonJobRequestDto job;

    private PythonResumeRequestDto resume;
}