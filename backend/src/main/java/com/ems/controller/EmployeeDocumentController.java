package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.DocumentSummaryDto;
import com.ems.dto.EmployeeDocumentResponseDto;
import com.ems.service.EmployeeDocumentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employee-documents")
public class EmployeeDocumentController {

    private final EmployeeDocumentService documentService;

    public EmployeeDocumentController(
            EmployeeDocumentService documentService) {

        this.documentService = documentService;
    }


    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<EmployeeDocumentResponseDto>>
    uploadDocument(
            @RequestParam String documentType,
            @RequestParam MultipartFile file,
            Authentication authentication) {

        return documentService.uploadDocument(
                documentType,
                file,
                authentication
        );
    }


    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<EmployeeDocumentResponseDto>>>
    getMyDocuments(
            Authentication authentication) {

        return documentService.getMyDocuments(
                authentication
        );
    }


    // =========================================================
    // GET DOCUMENT SUMMARY
    // =========================================================

    @GetMapping("/my/summary")
    public ResponseEntity<ApiResponse<DocumentSummaryDto>>
    getDocumentSummary(
            Authentication authentication) {

        return documentService.getDocumentSummary(
                authentication
        );
    }


    // =========================================================
    // GET MY DOCUMENT BY ID
    // =========================================================

    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<EmployeeDocumentResponseDto>>
    getMyDocumentById(
            @PathVariable Long documentId,
            Authentication authentication) {

        return documentService.getMyDocumentById(
                documentId,
                authentication
        );
    }


    // =========================================================
    // DELETE MY DOCUMENT
    // =========================================================

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteMyDocument(
            @PathVariable Long documentId,
            Authentication authentication) {

        return documentService.deleteMyDocument(
                documentId,
                authentication
        );
    }
}