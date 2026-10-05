package com.ems.service;

import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeEducationExtractionService {

    private static final Pattern EDUCATION_PATTERN = Pattern.compile(
            "\\b(bachelor|b\\.tech|btech|b\\.e|be|master|m\\.tech|mtech|m\\.e|me|mba|phd|doctorate|diploma)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public String extractEducation(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        Matcher matcher = EDUCATION_PATTERN.matcher(text);

        StringBuilder education = new StringBuilder();

        while (matcher.find()) {

            String value = matcher.group();

            if (education.length() > 0) {
                education.append(", ");
            }

            education.append(value);
        }

        return education.toString();
    }
}