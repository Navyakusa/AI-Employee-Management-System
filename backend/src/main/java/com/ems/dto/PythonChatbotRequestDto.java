
package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PythonChatbotRequestDto {

    private String message;

    private List<String> conversation_history = new ArrayList<>();

    private String role;

    private List<ChatbotJobDto> jobs = new ArrayList<>();

    // Legacy field retained for backward compatibility.
    // The updated ChatbotService deliberately leaves it null.
    private String job_context;
}
