package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.EmailTemplateDto;
import com.ems.entity.EmailTemplate;
import com.ems.repository.EmailTemplateRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;


    // =========================================================
    // GET ALL TEMPLATES
    // =========================================================

    public ResponseEntity<ApiResponse<List<EmailTemplate>>> getAllTemplates() {

        List<EmailTemplate> templates =
                emailTemplateRepository.findAllByOrderByTemplateCodeAsc();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Email templates fetched successfully",
                        templates
                )
        );
    }


    // =========================================================
    // GET TEMPLATE BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<EmailTemplate>> getTemplateById(
            Long id) {

        EmailTemplate template =
                emailTemplateRepository.findById(id)
                        .orElse(null);

        if (template == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Email template not found",
                                    null
                            )
                    );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Email template fetched successfully",
                        template
                )
        );
    }


    // =========================================================
    // CREATE TEMPLATE
    // =========================================================

    public ResponseEntity<ApiResponse<EmailTemplate>> createTemplate(
            EmailTemplateDto dto) {

        if (dto.getTemplateCode() == null ||
                dto.getTemplateCode().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Template code is required",
                                    null
                            )
                    );
        }

        if (dto.getSubject() == null ||
                dto.getSubject().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Subject is required",
                                    null
                            )
                    );
        }

        if (dto.getBody() == null ||
                dto.getBody().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Email body is required",
                                    null
                            )
                    );
        }

        if (emailTemplateRepository
                .findByTemplateCode(dto.getTemplateCode())
                .isPresent()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Template code already exists",
                                    null
                            )
                    );
        }

        EmailTemplate template = new EmailTemplate();

        template.setTemplateCode(
                dto.getTemplateCode().trim().toUpperCase()
        );

        template.setSubject(dto.getSubject().trim());

        template.setBody(dto.getBody());

        template.setActive(
                dto.getActive() != null
                        ? dto.getActive()
                        : true
        );

        EmailTemplate saved =
                emailTemplateRepository.save(template);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Email template created successfully",
                                saved
                        )
                );
    }


    // =========================================================
    // UPDATE TEMPLATE
    // =========================================================

    public ResponseEntity<ApiResponse<EmailTemplate>> updateTemplate(
            Long id,
            EmailTemplateDto dto) {

        EmailTemplate template =
                emailTemplateRepository.findById(id)
                        .orElse(null);

        if (template == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Email template not found",
                                    null
                            )
                    );
        }

        if (dto.getSubject() != null &&
                !dto.getSubject().isBlank()) {

            template.setSubject(dto.getSubject().trim());
        }

        if (dto.getBody() != null &&
                !dto.getBody().isBlank()) {

            template.setBody(dto.getBody());
        }

        if (dto.getActive() != null) {

            template.setActive(dto.getActive());
        }

        EmailTemplate updated =
                emailTemplateRepository.save(template);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Email template updated successfully",
                        updated
                )
        );
    }


    // =========================================================
    // ENABLE / DISABLE TEMPLATE
    // =========================================================

    public ResponseEntity<ApiResponse<EmailTemplate>> updateStatus(
            Long id,
            Boolean active) {

        EmailTemplate template =
                emailTemplateRepository.findById(id)
                        .orElse(null);

        if (template == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Email template not found",
                                    null
                            )
                    );
        }

        template.setActive(active);

        EmailTemplate updated =
                emailTemplateRepository.save(template);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        active
                                ? "Email template activated successfully"
                                : "Email template deactivated successfully",
                        updated
                )
        );
    }
}