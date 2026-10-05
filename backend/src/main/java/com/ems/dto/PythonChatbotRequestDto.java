package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class PythonChatbotRequestDto {

    private String message;

    private List<String> conversation_history = new ArrayList<>();

    private String job_context;

    private String role;
}
