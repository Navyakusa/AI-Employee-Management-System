
package com.ems.controller;

import com.ems.dto.DocumentVerificationRequestDto;
import com.ems.dto.OnboardingDocumentResponseDto;
import com.ems.service.OnboardingDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingDocumentController {

    private final OnboardingDocumentService documentService;

    public OnboardingDocumentController(
            OnboardingDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(
            value = "/{onboardingId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<OnboardingDocumentResponseDto> uploadDocument(
            @PathVariable Long onboardingId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file,
            Authentication authentication) throws IOException {

        OnboardingDocumentResponseDto result =
                documentService.uploadDocument(
                        onboardingId,
                        documentType,
                        file,
                        authentication.getName());

        return ResponseEntity.status(201).body(result);
    }


    @GetMapping("/{onboardingId}/documents")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN', 'CANDIDATE')")
    public ResponseEntity<List<OnboardingDocumentResponseDto>> getDocuments(
            @PathVariable Long onboardingId,
            Authentication authentication) {

        boolean isCandidate = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_CANDIDATE"));

        List<OnboardingDocumentResponseDto> documents;

        if (isCandidate) {
            documents = documentService.getDocumentsForCandidate(
                    onboardingId, authentication.getName());
        } else {
            documents = documentService.getDocuments(onboardingId);
        }

        return ResponseEntity.ok(documents);
    }


    @GetMapping("/documents/{documentId}/file")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long documentId) throws IOException {

        Resource resource =
                documentService.getDocumentFile(documentId);

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;

        String filename = resource.getFilename();

        if (filename != null) {
            String lower = filename.toLowerCase();

            if (lower.endsWith(".pdf")) {
                contentType = MediaType.APPLICATION_PDF;
            } else if (lower.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            } else if (lower.endsWith(".jpg")
                    || lower.endsWith(".jpeg")) {
                contentType = MediaType.IMAGE_JPEG;
            }
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    @PutMapping("/documents/{documentId}/verify")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<OnboardingDocumentResponseDto> verifyDocument(
            @PathVariable Long documentId,
            @RequestBody DocumentVerificationRequestDto request,
            Authentication authentication) {

        return ResponseEntity.ok(
                documentService.verifyDocument(
                        documentId,
                        request,
                        authentication.getName()));
    }
}
