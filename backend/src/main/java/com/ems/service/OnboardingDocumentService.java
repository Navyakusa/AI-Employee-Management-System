package com.ems.service;

import com.ems.common.OnboardingStatus;
import com.ems.dto.DocumentVerificationRequestDto;
import com.ems.dto.OnboardingDocumentResponseDto;
import com.ems.entity.Candidate;
import com.ems.entity.Onboarding;
import com.ems.entity.OnboardingDocument;
import com.ems.repository.CandidateRepository;
import com.ems.repository.OnboardingDocumentRepository;
import com.ems.repository.OnboardingRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class OnboardingDocumentService {

    private final OnboardingDocumentRepository documentRepository;
    private final OnboardingRepository onboardingRepository;
    private final CandidateRepository candidateRepository;

    private final Path uploadDirectory = Paths
            .get("uploads", "onboarding-documents")
            .toAbsolutePath()
            .normalize();

    public OnboardingDocumentService(
            OnboardingDocumentRepository documentRepository,
            OnboardingRepository onboardingRepository,
            CandidateRepository candidateRepository) {

        this.documentRepository = documentRepository;
        this.onboardingRepository = onboardingRepository;
        this.candidateRepository = candidateRepository;
    }

    @Transactional
    public OnboardingDocumentResponseDto uploadDocument(
            Long onboardingId,
            String documentType,
            MultipartFile file,
            String authenticatedEmail) throws IOException {

        if (documentType == null || documentType.isBlank()) {
            throw new IllegalArgumentException("Document type is required");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a document to upload");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Maximum document size is 10 MB");
        }

        Onboarding onboarding = onboardingRepository
                .findById(onboardingId)
                .orElseThrow(() -> new IllegalArgumentException("Onboarding record not found"));

        Candidate candidate = candidateRepository
                .findById(onboarding.getCandidateId())
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        if (candidate.getEmail() == null
                || !candidate.getEmail().equalsIgnoreCase(authenticatedEmail)) {
            throw new SecurityException("You cannot upload documents for this candidate");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Document filename is required");
        }

        String safeName = Paths.get(originalName).getFileName().toString();
        String lowerName = safeName.toLowerCase(Locale.ROOT);

        if (!(lowerName.endsWith(".pdf")
                || lowerName.endsWith(".jpg")
                || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".png"))) {
            throw new IllegalArgumentException("Only PDF, JPG, JPEG and PNG files are allowed");
        }

        Files.createDirectories(uploadDirectory);

        String storedName = java.util.UUID.randomUUID() + "_" + safeName;
        Path target = uploadDirectory.resolve(storedName).normalize();

        if (!target.startsWith(uploadDirectory)) {
            throw new SecurityException("Invalid file path");
        }

        file.transferTo(target);

        try {
            OnboardingDocument document = OnboardingDocument.builder()
                    .onboardingId(onboardingId)
                    .candidateId(candidate.getId())
                    .documentType(documentType.trim())
                    .fileName(safeName)
                    .fileType(file.getContentType())
                    .filePath(target.toString())
                    .status("PENDING")
                    .build();

            OnboardingDocument saved = documentRepository.save(document);
            onboarding.setStatus(OnboardingStatus.DOCUMENTS_SUBMITTED);
            onboardingRepository.save(onboarding);

            return toDto(saved);
        } catch (RuntimeException exception) {
            Files.deleteIfExists(target);
            throw exception;
        }
    }

    /** HR/Super Admin document-list access. Role restrictions are enforced in the controller. */
    @Transactional(readOnly = true)
    public List<OnboardingDocumentResponseDto> getDocuments(Long onboardingId) {
        if (!onboardingRepository.existsById(onboardingId)) {
            throw new IllegalArgumentException("Onboarding record not found");
        }

        return documentRepository.findByOnboardingId(onboardingId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /** Candidate can view documents only when the onboarding belongs to their authenticated email. */
    @Transactional(readOnly = true)
    public List<OnboardingDocumentResponseDto> getDocumentsForCandidate(
            Long onboardingId, String authenticatedEmail) {

        Onboarding onboarding = onboardingRepository.findById(onboardingId)
                .orElseThrow(() -> new IllegalArgumentException("Onboarding record not found"));

        Candidate candidate = candidateRepository.findById(onboarding.getCandidateId())
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        if (candidate.getEmail() == null
                || authenticatedEmail == null
                || !candidate.getEmail().equalsIgnoreCase(authenticatedEmail)) {
            throw new SecurityException("You cannot view documents for this candidate");
        }

        return documentRepository.findByOnboardingId(onboardingId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Resource getDocumentFile(Long documentId) throws IOException {
        OnboardingDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        Path storedPath = Paths.get(document.getFilePath())
                .toAbsolutePath()
                .normalize();

        if (!storedPath.startsWith(uploadDirectory) || !Files.isRegularFile(storedPath)) {
            throw new IOException("Document file is unavailable");
        }

        Resource resource = new UrlResource(storedPath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IOException("Document file cannot be read");
        }

        return resource;
    }

    @Transactional
    public OnboardingDocumentResponseDto verifyDocument(
            Long documentId,
            DocumentVerificationRequestDto request,
            String authenticatedEmail) {

        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException("Verification status is required");
        }

        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!status.equals("VERIFIED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Status must be VERIFIED or REJECTED");
        }

        if (status.equals("REJECTED")
                && (request.getRejectionReason() == null
                || request.getRejectionReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        OnboardingDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        document.setStatus(status);
        document.setRejectionReason(
                status.equals("REJECTED") ? request.getRejectionReason().trim() : null);
        document.setVerifiedBy(authenticatedEmail);
        document.setVerifiedAt(LocalDateTime.now());

        OnboardingDocument saved = documentRepository.save(document);

        Onboarding onboarding = onboardingRepository.findById(document.getOnboardingId())
                .orElseThrow(() -> new IllegalArgumentException("Onboarding record not found"));

        List<OnboardingDocument> documents =
                documentRepository.findByOnboardingId(onboarding.getOnboardingId());

        boolean anyRejected = documents.stream()
                .anyMatch(d -> "REJECTED".equalsIgnoreCase(d.getStatus()));
        boolean allVerified = !documents.isEmpty()
                && documents.stream()
                .allMatch(d -> "VERIFIED".equalsIgnoreCase(d.getStatus()));

        if (anyRejected) {
            onboarding.setStatus(OnboardingStatus.DOCUMENTS_PENDING);
        } else if (allVerified) {
            onboarding.setStatus(OnboardingStatus.HR_VERIFICATION);
        } else {
            onboarding.setStatus(OnboardingStatus.DOCUMENTS_SUBMITTED);
        }

        onboardingRepository.save(onboarding);
        return toDto(saved);
    }

    private OnboardingDocumentResponseDto toDto(OnboardingDocument document) {
        return OnboardingDocumentResponseDto.builder()
                .id(document.getId())
                .onboardingId(document.getOnboardingId())
                .candidateId(document.getCandidateId())
                .documentType(document.getDocumentType())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .status(document.getStatus())
                .rejectionReason(document.getRejectionReason())
                .verifiedBy(document.getVerifiedBy())
                .uploadedAt(document.getUploadedAt())
                .verifiedAt(document.getVerifiedAt())
                .build();
    }
}
