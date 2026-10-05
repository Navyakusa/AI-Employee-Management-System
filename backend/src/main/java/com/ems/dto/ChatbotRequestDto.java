package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ChatbotRequestDto {

    @NotBlank(message = "Message is required")
    private String message;

    private List<String> conversation_history = new ArrayList<>();

    private String job_context;
}