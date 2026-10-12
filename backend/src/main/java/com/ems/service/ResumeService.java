package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.ResumeManagementDto;
import com.ems.dto.ResumeParseResponseDto;
import com.ems.dto.ResumeRequestDto;
import com.ems.dto.ResumeResponseDto;
import com.ems.dto.ResumeStatsDto;
import com.ems.entity.*;
import com.ems.mapper.ResumeMapper;
import com.ems.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AIResumeScreeningRepository aiResumeScreeningRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ResumeMapper resumeMapper;

    @Autowired
    private ResumeTextExtractionService resumeTextExtractionService;

    @Autowired
    private ResumeTextCleaningService resumeTextCleaningService;

    @Autowired
    private ResumeNlpProcessingService resumeNlpProcessingService;

    @Autowired
    private ResumeSkillExtractionService resumeSkillExtractionService;

    @Autowired
    private ResumeExperienceExtractionService resumeExperienceExtractionService;

    @Autowired
    private ResumeEducationExtractionService resumeEducationExtractionService;

    @Autowired
    private StructuredCandidateProfileService structuredCandidateProfileService;

    // ============================================================
    // NEW: ML Resume Parsing Client
    // ============================================================

    @Autowired
    private MlResumeParsingClient mlResumeParsingClient;

    @Value("${app.upload.resume-dir}")
    private String resumeUploadDirectory;


    // ============================================================
    // Upload Resume
    // ============================================================

    public ResponseEntity<ApiResponse<ResumeResponseDto>> uploadResume(
            ResumeRequestDto request) {

        Path uploadedFilePath = null;
        boolean resumeRecordSaved = false;

        try {
            if (request == null || request.getCandidateId() == null) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, "Candidate ID is required", null));
            }

            Long candidateId = request.getCandidateId();
            MultipartFile file = request.getFile();

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, "Resume file is required", null));
            }

            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isBlank()) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, "Invalid resume file name", null));
            }

            String fileName = Paths.get(originalFileName).getFileName().toString();
            int dotIndex = fileName.lastIndexOf('.');
            if (dotIndex <= 0) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false,
                                "Resume file must have an extension", null));
            }

            String extension = fileName.substring(dotIndex + 1)
                    .toLowerCase(java.util.Locale.ROOT);
            if (!List.of("pdf", "doc", "docx").contains(extension)) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false,
                                "Only PDF, DOC, and DOCX files are supported", null));
            }

            // Use the configured persistent directory on the backend server.
            Path uploadDirectory = Paths.get(resumeUploadDirectory)
                    .toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);
            if (!Files.isDirectory(uploadDirectory) || !Files.isWritable(uploadDirectory)) {
                throw new IOException("Resume upload directory is not writable: "
                        + uploadDirectory);
            }

            String storedFileName = UUID.randomUUID() + "." + extension;
            uploadedFilePath = uploadDirectory.resolve(storedFileName).normalize();
            if (!uploadedFilePath.startsWith(uploadDirectory)) {
                throw new IOException("Invalid resume file path");
            }

            try (java.io.InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, uploadedFilePath);
            }
            if (!Files.isRegularFile(uploadedFilePath)
                    || !Files.isReadable(uploadedFilePath)
                    || Files.size(uploadedFilePath) == 0) {
                throw new IOException("Uploaded resume file could not be verified");
            }

            System.out.println("Resume file saved successfully.");
            System.out.println("Candidate ID: " + candidateId);
            System.out.println("Stored file: " + storedFileName);
            System.out.println("Physical path: " + uploadedFilePath);

            // Preserve the existing resume parsing and AI extraction workflow.
            String extractedText = resumeTextExtractionService.extractText(
                    uploadedFilePath.toString(), extension);
            String cleanedText = resumeTextCleaningService.cleanText(extractedText);
            String processedText = resumeNlpProcessingService.processText(cleanedText);

            String extractedSkills = "";
            String extractedEducation = "";
            try {
                ResumeParseResponseDto aiResult =
                        mlResumeParsingClient.parseResume(processedText);
                if (aiResult != null) {
                    if (aiResult.getSkillsCleaned() != null
                            && !aiResult.getSkillsCleaned().isEmpty()) {
                        extractedSkills = String.join(", ", aiResult.getSkillsCleaned());
                    }
                    if (aiResult.getDegree() != null && !aiResult.getDegree().isEmpty()) {
                        extractedEducation = String.join(", ", aiResult.getDegree());
                    }
                }
            } catch (Exception e) {
                System.err.println("AI resume parsing failed; using Java fallback: "
                        + e.getMessage());
            }

            if (extractedSkills == null || extractedSkills.isBlank()) {
                extractedSkills = resumeSkillExtractionService.extractSkills(processedText);
            }
            String extractedExperience =
                    resumeExperienceExtractionService.extractExperience(processedText);
            if (extractedEducation == null || extractedEducation.isBlank()) {
                extractedEducation =
                        resumeEducationExtractionService.extractEducation(processedText);
            }

            Resume resume = resumeMapper.toEntity(request);
            resume.setFileName(fileName);
            resume.setFileType(extension);
            // Store a relative unique filename, not a machine-specific absolute path.
            // View/download resolve it against resumeUploadDirectory.
            resume.setFilePath(storedFileName);
            resume.setExtractedText(processedText);
            resume.setExtractedSkills(extractedSkills);
            resume.setExtractedExperience(extractedExperience);
            resume.setExtractedEducation(extractedEducation);

            Resume savedResume = resumeRepository.save(resume);
            resumeRecordSaved = true;

            System.out.println("Resume database record saved.");
            System.out.println("Resume ID: " + savedResume.getId());
            System.out.println("Candidate ID: " + candidateId);
            System.out.println("Stored path: " + savedResume.getFilePath());

            // A structured-profile failure must not invalidate the saved resume.
            try {
                structuredCandidateProfileService.createProfile(savedResume);
            } catch (Exception e) {
                System.err.println("Resume saved, but structured profile creation failed: "
                        + e.getMessage());
            }

            ResumeResponseDto responseDto = resumeMapper.toResponseDto(savedResume);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new ApiResponse<>(true,
                            "Resume uploaded and processed successfully", responseDto));

        } catch (Exception e) {
            System.err.println("Resume upload failed: " + e.getMessage());
            e.printStackTrace();

            // Remove an orphaned file only if no database record was saved.
            if (!resumeRecordSaved && uploadedFilePath != null) {
                try {
                    Files.deleteIfExists(uploadedFilePath);
                } catch (IOException cleanupException) {
                    System.err.println("Could not clean up uploaded resume: "
                            + cleanupException.getMessage());
                }
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ApiResponse<>(false,
                            "Failed to upload or process resume. Check backend logs.", null));
        }
    }


    // ============================================================
    // Create Resume Record
    // ============================================================

    public ResponseEntity<ApiResponse<ResumeResponseDto>> createResume(
            ResumeRequestDto dto) {

        // Never create a database-only resume record. All resume records must
        // be created through the upload flow so the physical file is saved too.
        if (dto == null || dto.getFile() == null || dto.getFile().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Resume file is required. Use the resume upload endpoint.",
                            null
                    )
            );
        }

        return uploadResume(dto);
    }


    // ============================================================
    // Get All Resumes
    // ============================================================

    public ResponseEntity<ApiResponse<List<ResumeResponseDto>>>
    getAllResumes() {

        try {

            List<ResumeResponseDto> resumes =
                    resumeRepository.findAll()
                            .stream()
                            .map(resumeMapper::toResponseDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resumes retrieved successfully",
                            resumes
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve resumes",
                            null
                    ));
        }
    }


    // ============================================================
    // Get Resume By ID
    // ============================================================

    public ResponseEntity<ApiResponse<ResumeResponseDto>> getResumeById(
            Long id) {

        try {

            Resume resume =
                    resumeRepository.findById(id).orElse(null);

            if (resume == null) {

                return ResponseEntity.status(
                                HttpStatus.NOT_FOUND
                        )
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found",
                                null
                        ));
            }

            ResumeResponseDto responseDto =
                    resumeMapper.toResponseDto(resume);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume retrieved successfully",
                            responseDto
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve resume",
                            null
                    ));
        }
    }


    // ============================================================
    // Update Resume
    // ============================================================

    public ResponseEntity<ApiResponse<ResumeResponseDto>> updateResume(
            Long id,
            ResumeRequestDto dto) {

        try {

            Resume existingResume =
                    resumeRepository.findById(id).orElse(null);

            if (existingResume == null) {

                return ResponseEntity.status(
                                HttpStatus.NOT_FOUND
                        )
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found",
                                null
                        ));
            }

            existingResume.setCandidateId(
                    dto.getCandidateId()
            );

            Resume updatedResume =
                    resumeRepository.save(existingResume);

            ResumeResponseDto responseDto =
                    resumeMapper.toResponseDto(updatedResume);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume updated successfully",
                            responseDto
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(new ApiResponse<>(
                            false,
                            "Failed to update resume",
                            null
                    ));
        }
    }


    // ============================================================
    // Delete Resume
    // ============================================================

    public ResponseEntity<ApiResponse<String>> deleteResume(
            Long id) {

        try {

            Resume resume =
                    resumeRepository.findById(id).orElse(null);

            if (resume == null) {

                return ResponseEntity.status(
                                HttpStatus.NOT_FOUND
                        )
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found",
                                null
                        ));
            }

            resumeRepository.delete(resume);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume deleted successfully",
                            null
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(new ApiResponse<>(
                            false,
                            "Failed to delete resume",
                            null
                    ));
        }
    }


    // Resolve both new filename-only records and legacy absolute-path records.
    private Path resolveResumePath(String storedPath) throws IOException {
        if (storedPath == null || storedPath.isBlank()) {
            throw new IOException("Resume file path is missing");
        }

        // Normalize Windows-style legacy paths even if the backend later runs
        // on a non-Windows operating system.
        String portableStoredPath = storedPath.replace('\\', '/');
        Path stored = Paths.get(portableStoredPath).normalize();
        Path uploadDirectory = Paths.get(resumeUploadDirectory)
                .toAbsolutePath().normalize();

        // Legacy record: use the absolute path if the original file still exists.
        if (stored.isAbsolute()
                && Files.isRegularFile(stored)
                && Files.isReadable(stored)) {
            return stored;
        }

        // New records store only the generated filename. For old absolute paths
        // whose original location is unavailable, try the filename in current storage.
        Path fileName = stored.getFileName();
        if (fileName == null) {
            throw new IOException("Invalid resume file path");
        }

        Path resolved = uploadDirectory.resolve(fileName).normalize();
        if (!resolved.startsWith(uploadDirectory)) {
            throw new IOException("Invalid resume file path");
        }
        return resolved;
    }

    // ============================================================
    // View Resume
    // ============================================================

    public ResponseEntity<?> viewResume(Long id) {

        try {

            Resume resume =
                    resumeRepository
                            .findById(id)
                            .orElse(null);

            if (resume == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found",
                                null
                        ));
            }

            if (resume.getFilePath() == null
                    || resume.getFilePath().isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume file path not found",
                                null
                        ));
            }

            Path filePath = resolveResumePath(resume.getFilePath());

            System.out.println(
                    "========== RESUME VIEW =========="
            );

            System.out.println(
                    "Resume ID: " + resume.getId()
            );

            System.out.println(
                    "DB Path: " + resume.getFilePath()
            );

            System.out.println(
                    "Absolute Path: " + filePath
            );

            System.out.println(
                    "Exists: " + Files.exists(filePath)
            );

            System.out.println(
                    "Readable: " + Files.isReadable(filePath)
            );

            System.out.println(
                    "================================="
            );

            if (!Files.exists(filePath)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume file not found on server",
                                null
                        ));
            }

            if (!Files.isReadable(filePath)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume file is not readable",
                                null
                        ));
            }

            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume resource is not readable",
                                null
                        ));
            }

            String contentType;

            String fileName =
                    resume.getFileName() != null
                            ? resume.getFileName().toLowerCase()
                            : "";

            if (fileName.endsWith(".pdf")) {

                contentType =
                        MediaType.APPLICATION_PDF_VALUE;

            } else if (fileName.endsWith(".doc")) {

                contentType =
                        "application/msword";

            } else if (fileName.endsWith(".docx")) {

                contentType =
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            } else {

                contentType =
                        MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(contentType)
                    )
                    .contentLength(
                            Files.size(filePath)
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    resume.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            System.err.println(
                    "Error while viewing resume ID: " + id
            );

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to view resume: "
                                    + e.getMessage(),
                            null
                    ));
        }
    }


    // ============================================================
    // Download Resume
    // ============================================================

    public ResponseEntity<?> downloadResume(Long id) {

        try {

            Resume resume =
                    resumeRepository
                            .findById(id)
                            .orElse(null);

            if (resume == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found",
                                null
                        ));
            }

            if (resume.getFilePath() == null
                    || resume.getFilePath().isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume file path not found",
                                null
                        ));
            }

            Path filePath = resolveResumePath(resume.getFilePath());

            if (!Files.exists(filePath)
                    || !Files.isReadable(filePath)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume file not found on server",
                                null
                        ));
            }

            Resource resource =
                    new UrlResource(filePath.toUri());

            String contentType =
                    Files.probeContentType(filePath);

            if (contentType == null) {

                contentType =
                        MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(contentType)
                    )
                    .contentLength(
                            Files.size(filePath)
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    resume.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to download resume",
                            null
                    ));
        }
    }


    // ============================================================
    // Resume Management
    // ============================================================

    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    getResumeManagementData() {

        try {

            List<Resume> resumes =
                    resumeRepository.findAll();

            List<ResumeManagementDto> result =
                    new ArrayList<>();

            for (Resume resume : resumes) {

                ResumeManagementDto dto =
                        new ResumeManagementDto();

                dto.setResumeId(
                        resume.getId()
                );

                dto.setCandidateId(
                        resume.getCandidateId()
                );

                dto.setExperience(
                        resume.getExtractedExperience()
                );

                dto.setSkills(
                        resume.getExtractedSkills()
                );

                dto.setUploadedAt(
                        resume.getUploadedAt()
                );


                // ==============================
                // Physical File Availability
                // ==============================

                boolean fileAvailable = false;

                if (resume.getFilePath() != null
                        && !resume.getFilePath().isBlank()) {

                    try {

                        Path filePath = resolveResumePath(resume.getFilePath());
                        fileAvailable = Files.isRegularFile(filePath)
                                && Files.isReadable(filePath);
                        System.out.println(
                                "Resume ID: " + resume.getId()
                                        + " | DB Path: " + resume.getFilePath()
                                        + " | Resolved Path: " + filePath
                                        + " | Exists: " + Files.exists(filePath)
                                        + " | File Available: " + fileAvailable
                        );

                    } catch (Exception ignored) {

                        fileAvailable = false;
                    }
                }

                dto.setFileAvailable(
                        fileAvailable



                );


                // ==============================
                // Candidate
                // ==============================

                Candidate candidate =
                        candidateRepository
                                .findById(
                                        resume.getCandidateId()
                                )
                                .orElse(null);

                if (candidate != null) {

                    dto.setCandidateName(
                            candidate.getName()
                    );

                    dto.setCandidateEmail(
                            candidate.getEmail()
                    );
                }


                // ==============================
                // Latest Application
                // ==============================

                Application application =
                        applicationRepository
                                .findFirstByCandidateIdOrderByAppliedAtDesc(
                                        resume.getCandidateId()
                                )
                                .orElse(null);

                if (application != null) {

                    dto.setApplicationId(
                            application.getApplicationId()
                    );

                    dto.setJobId(
                            application.getJobId()
                    );

                    if (application.getStatus() != null) {

                        dto.setStatus(
                                application
                                        .getStatus()
                                        .name()
                        );
                    }


                    // ==============================
                    // Job / Position
                    // ==============================

                    Job job =
                            jobRepository
                                    .findById(
                                            application.getJobId()
                                    )
                                    .orElse(null);

                    if (job != null) {

                        dto.setPosition(
                                job.getTitle()
                        );
                    }


                    // ==============================
                    // AI Match
                    // ==============================

                    AIResumeScreening screening =
                            aiResumeScreeningRepository
                                    .findFirstByCandidateIdAndJobIdOrderByIdDesc(
                                            resume.getCandidateId(),
                                            application.getJobId()
                                    )
                                    .orElse(null);

                    if (screening != null) {

                        dto.setAiMatch(
                                screening.getScreeningScore()
                        );
                    }
                }

                result.add(dto);
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume management data retrieved successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve resume management data",
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // Resume Statistics
    // ============================================================

    public ResponseEntity<ApiResponse<ResumeStatsDto>>
    getResumeStats() {

        try {

            long totalResumes =
                    resumeRepository.count();

            long shortlisted = 0;
            long underScreening = 0;
            long highMatch = 0;

            List<Resume> resumes =
                    resumeRepository.findAll();

            for (Resume resume : resumes) {

                Application application =
                        applicationRepository
                                .findFirstByCandidateIdOrderByAppliedAtDesc(
                                        resume.getCandidateId()
                                )
                                .orElse(null);

                if (application != null) {

                    // Shortlisted
                    if (application.getStatus() != null
                            && application.getStatus()
                            .name()
                            .equalsIgnoreCase("SHORTLISTED")) {

                        shortlisted++;
                    }

                    // Under Screening
                    if (application.getStatus() != null
                            && application.getStatus()
                            .name()
                            .equalsIgnoreCase("SCREENING")) {

                        underScreening++;
                    }

                    // AI Match
                    AIResumeScreening screening =
                            aiResumeScreeningRepository
                                    .findFirstByCandidateIdAndJobIdOrderByIdDesc(
                                            resume.getCandidateId(),
                                            application.getJobId()
                                    )
                                    .orElse(null);

                    if (screening != null
                            && screening.getScreeningScore() != null
                            && screening.getScreeningScore() >= 80.0) {

                        highMatch++;
                    }
                }
            }

            ResumeStatsDto stats =
                    new ResumeStatsDto(
                            totalResumes,
                            shortlisted,
                            underScreening,
                            highMatch
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume statistics retrieved successfully",
                            stats
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve resume statistics",
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // Search Resumes
    // ============================================================

    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    searchResumes(String keyword) {

        try {

            ResponseEntity<ApiResponse<List<ResumeManagementDto>>> response =
                    getResumeManagementData();

            List<ResumeManagementDto> resumes =
                    response.getBody() != null
                            ? response.getBody().getData()
                            : new ArrayList<>();

            String search =
                    keyword == null
                            ? ""
                            : keyword.trim().toLowerCase();

            List<ResumeManagementDto> filtered =
                    resumes.stream()
                            .filter(resume ->

                                    containsIgnoreCase(
                                            resume.getCandidateName(),
                                            search
                                    )

                                            ||

                                            containsIgnoreCase(
                                                    resume.getCandidateEmail(),
                                                    search
                                            )

                                            ||

                                            containsIgnoreCase(
                                                    resume.getPosition(),
                                                    search
                                            )

                                            ||

                                            containsIgnoreCase(
                                                    resume.getSkills(),
                                                    search
                                            )
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resume search completed successfully",
                            filtered
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to search resumes",
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // Contains Ignore Case
    // ============================================================

    private boolean containsIgnoreCase(
            String value,
            String search) {

        return value != null
                && value.toLowerCase().contains(search);
    }


    // ============================================================
    // Filter Resumes By Status
    // ============================================================

    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    getResumesByStatus(String status) {

        try {

            ResponseEntity<ApiResponse<List<ResumeManagementDto>>> response =
                    getResumeManagementData();

            List<ResumeManagementDto> resumes =
                    response.getBody() != null
                            ? response.getBody().getData()
                            : new ArrayList<>();

            List<ResumeManagementDto> filtered =
                    resumes.stream()
                            .filter(resume ->
                                    resume.getStatus() != null
                                            && resume.getStatus()
                                            .equalsIgnoreCase(status)
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Resumes filtered successfully",
                            filtered
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to filter resumes",
                                    null
                            )
                    );
        }
    }
}
