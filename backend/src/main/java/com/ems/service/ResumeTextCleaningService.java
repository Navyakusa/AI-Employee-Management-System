package com.ems.service;

import org.springframework.stereotype.Service;

@Service
public class ResumeTextCleaningService {

    public String cleanText(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        // Preserve line breaks.
        // Only normalize spaces and tabs.
        return text
                .replaceAll("[ \\t]+", " ")
                .trim();
    }
}