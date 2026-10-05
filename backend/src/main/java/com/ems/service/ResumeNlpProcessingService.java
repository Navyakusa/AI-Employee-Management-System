package com.ems.service;

import org.springframework.stereotype.Service;

@Service
public class ResumeNlpProcessingService {

    public String processText(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        // Preserve line breaks.
        // Only normalize spaces and tabs.
        return text
                .trim()
                .replaceAll("[ \\t]+", " ");
    }
}