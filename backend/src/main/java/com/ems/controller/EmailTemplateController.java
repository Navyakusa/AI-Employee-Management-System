package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.EmailTemplateDto;
import com.ems.entity.EmailTemplate;
import com.ems.service.EmailTemplateService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmailTemplateController {

    private final EmailTemplateService emailTemplateService;


    @GetMapping
    public ResponseEntity<ApiResponse<List<EmailTemplate>>>
    getAllTemplates() {

        return emailTemplateService.getAllTemplates();
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailTemplate>>
    getTemplateById(
            @PathVariable Long id) {

        return emailTemplateService.getTemplateById(id);
    }


    @PostMapping
    public ResponseEntity<ApiResponse<EmailTemplate>>
    createTemplate(
            @RequestBody EmailTemplateDto dto) {

        return emailTemplateService.createTemplate(dto);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailTemplate>>
    updateTemplate(
            @PathVariable Long id,
            @RequestBody EmailTemplateDto dto) {

        return emailTemplateService.updateTemplate(
                id,
                dto
        );
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmailTemplate>>
    updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        return emailTemplateService.updateStatus(
                id,
                active
        );
    }
}