package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterPipelineDto {

    private long applied;
    private long aiScreened;
    private long shortlisted;
    private long hrScreening;
    private long interview;
    private long selected;
}