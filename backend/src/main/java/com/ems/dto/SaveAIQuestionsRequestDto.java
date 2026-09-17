package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveAIQuestionsRequestDto {

    private Long jobId;

    private List<String> questions;

    private String category;

    private String difficulty;
}