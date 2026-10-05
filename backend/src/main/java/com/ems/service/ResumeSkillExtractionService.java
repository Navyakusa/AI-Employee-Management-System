package com.ems.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeSkillExtractionService {

    private final List<String> skills = Arrays.asList(

            // Programming Languages
            "java",
            "python",
            "javascript",
            "typescript",
            "c",

            // Web Technologies
            "html",
            "css",
            "react",
            "angular",
            "node.js",
            "bootstrap",

            // Java / Backend
            "spring",
            "spring boot",
            "flask",

            // Databases
            "sql",
            "postgresql",
            "mysql",
            "mongodb",
            "dbms",

            // Cloud / DevOps
            "docker",
            "kubernetes",
            "git",
            "github",
            "aws",
            "azure",

            // AI / ML
            "machine learning",
            "artificial intelligence",
            "nlp",

            // Other Technologies
            "oops",
            "power bi",
            "figma"
    );

    public String extractSkills(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        String lowerText = text.toLowerCase();

        return skills.stream()
                .filter(skill -> containsWholeSkill(lowerText, skill))
                .collect(Collectors.joining(", "));
    }

    private boolean containsWholeSkill(String text, String skill) {

        String escapedSkill = java.util.regex.Pattern
                .quote(skill.toLowerCase());

        String regex = "(?<!\\w)" + escapedSkill + "(?!\\w)";

        return java.util.regex.Pattern
                .compile(regex, java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text)
                .find();
    }
}