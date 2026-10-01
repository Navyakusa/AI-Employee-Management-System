package com.ems.service;

import com.ems.dto.ChatbotRequestDto;
import com.ems.dto.PythonChatResponseDto;

import org.springframework.stereotype.Service;

@Service
public class ChatbotService {

    private final PythonAIClient pythonAIClient;

    public ChatbotService(
            PythonAIClient pythonAIClient
    ) {
        this.pythonAIClient = pythonAIClient;
    }

    public String getChatbotResponse(
            ChatbotRequestDto request
    ) {

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().isBlank()) {

            return "Please enter a message.";
        }

        PythonChatResponseDto response =
                pythonAIClient.chat(request);

        if (response == null ||
                response.getResponse() == null ||
                response.getResponse().isBlank()) {

            return "Sorry, I could not generate a response.";
        }

        return response.getResponse().trim();
    }
}