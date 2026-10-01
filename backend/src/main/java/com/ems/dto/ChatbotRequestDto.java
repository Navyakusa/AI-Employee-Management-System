package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class ChatbotRequestDto {

    @NotBlank(message = "Message is required")
    private String message;

    @JsonProperty("conversation_history")
    private List<Map<String, String>> conversationHistory =
            new ArrayList<>();
}