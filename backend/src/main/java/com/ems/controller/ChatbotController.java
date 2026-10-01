package com.ems.controller;

import com.ems.dto.ChatbotRequestDto;
import com.ems.dto.ChatbotResponseDto;
import com.ems.service.ChatbotService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(
            ChatbotService chatbotService
    ) {
        this.chatbotService = chatbotService;
    }


    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponseDto> chat(
            @Valid @RequestBody ChatbotRequestDto request
    ) {

        String response =
                chatbotService.getChatbotResponse(
                        request
                );

        return ResponseEntity.ok(
                new ChatbotResponseDto(response)
        );
    }
}