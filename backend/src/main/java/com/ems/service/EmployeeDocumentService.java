
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.DocumentSummaryDto;
import com.ems.dto.EmployeeDocumentResponseDto;
import com.ems.entity.Employee;
import com.ems.entity.EmployeeDocument;
import com.ems.repository.EmployeeDocumentRepository;
import com.ems.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;

    private final Path uploadDirectory =
            Paths.get("uploads", "employee-documents")
                    .toAbsolutePath()
                    .normalize();

    public EmployeeDocumentService(
            EmployeeDocumentRepository documentRepository,
            EmployeeRepository employeeRepository) {

        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
    }


    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    public ResponseEntity<ApiResponse<EmployeeDocumentResponseDto>>
    uploadDocument(
            String documentType,
            MultipartFile file,
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(authentication);

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // Validate document type
            // -------------------------------------------------

            if (documentType == null
                    || documentType.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Document type is required",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // Validate file
            // -------------------------------------------------

            if (file == null
                    || file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Document file is required",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // Validate file type
            // -------------------------------------------------

            String originalFileName =
                    file.getOriginalFilename();

            if (originalFileName == null
                    || originalFileName.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Invalid file name",
                                        null
                                )
                        );
            }


            String extension =
                    getFileExtension(
                            originalFileName
                    );


            if (!isAllowedFileType(extension)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only PDF, DOC, DOCX, JPG, JPEG and PNG files are allowed",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // Create upload directory
            // -------------------------------------------------

            Files.createDirectories(
                    uploadDirectory
            );


            // -------------------------------------------------
            // Generate unique file name
            // -------------------------------------------------

            String storedFileName =
                    UUID.randomUUID()
                            + extension;


            Path targetPath =
                    uploadDirectory
                            .resolve(storedFileName)
                            .normalize();


            // -------------------------------------------------
            // Save physical file
            // -------------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            // -------------------------------------------------
            // Save database record
            // -------------------------------------------------

            EmployeeDocument document =
                    EmployeeDocument.builder()
                            .employeeId(
                                    employee.getId()
                            )
                            .documentType(
                                    documentType
                            )
                            .documentName(
                                    documentType
                            )
                            .fileName(
                                    originalFileName
                            )
                            .fileType(
                                    extension
                            )
                            .filePath(
                                    targetPath.toString()
                            )
                            .status(
                                    "PENDING"
                            )
                            .uploadedAt(
                                    LocalDateTime.now()
                            )
                            .build();


            EmployeeDocument savedDocument =
                    documentRepository.save(
                            document
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Document uploaded successfully",
                                    mapToDto(
                                            savedDocument
                                    )
                            )
                    );

        } catch (IOException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to store document: "
                                            + e.getMessage(),
                                    null
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to upload document: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    public ResponseEntity<ApiResponse<List<EmployeeDocumentResponseDto>>>
    getMyDocuments(
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(
                            authentication
                    );

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            List<EmployeeDocumentResponseDto> documents =
                    documentRepository
                            .findByEmployeeIdOrderByUploadedAtDesc(
                                    employee.getId()
                            )
                            .stream()
                            .map(this::mapToDto)
                            .collect(Collectors.toList());


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Employee documents fetched successfully",
                            documents
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch documents: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET MY DOCUMENT BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<EmployeeDocumentResponseDto>>
    getMyDocumentById(
            Long documentId,
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(
                            authentication
                    );

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            EmployeeDocument document =
                    documentRepository
                            .findByIdAndEmployeeId(
                                    documentId,
                                    employee.getId()
                            )
                            .orElse(null);


            if (document == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Document not found",
                                        null
                                )
                        );
            }


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Document fetched successfully",
                            mapToDto(document)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch document: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // DOCUMENT SUMMARY
    // =========================================================

    public ResponseEntity<ApiResponse<DocumentSummaryDto>>
    getDocumentSummary(
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(
                            authentication
                    );

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            long total =
                    documentRepository
                            .countByEmployeeId(
                                    employee.getId()
                            );

            long verified =
                    documentRepository
                            .countByEmployeeIdAndStatusIgnoreCase(
                                    employee.getId(),
                                    "VERIFIED"
                            );

            long pending =
                    documentRepository
                            .countByEmployeeIdAndStatusIgnoreCase(
                                    employee.getId(),
                                    "PENDING"
                            );


            DocumentSummaryDto summary =
                    DocumentSummaryDto.builder()
                            .totalDocuments(total)
                            .verifiedDocuments(verified)
                            .pendingDocuments(pending)
                            .notUploadedDocuments(0L)
                            .build();


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Document summary fetched successfully",
                            summary
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch document summary: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // DELETE MY DOCUMENT
    // =========================================================

    public ResponseEntity<ApiResponse<Void>>
    deleteMyDocument(
            Long documentId,
            Authentication authentication) {

        try {

            Employee employee =
                    getLoggedInEmployee(
                            authentication
                    );

            if (employee == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Employee not found",
                                        null
                                )
                        );
            }


            EmployeeDocument document =
                    documentRepository
                            .findByIdAndEmployeeId(
                                    documentId,
                                    employee.getId()
                            )
                            .orElse(null);


            if (document == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Document not found",
                                        null
                                )
                        );
            }


            // Delete physical file
            if (document.getFilePath() != null) {

                try {

                    Files.deleteIfExists(
                            Paths.get(
                                    document.getFilePath()
                            )
                    );

                } catch (Exception ignored) {
                    // Database record can still be removed.
                }
            }


            documentRepository.delete(
                    document
            );


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Document deleted successfully",
                            null
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to delete document: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET LOGGED-IN EMPLOYEE
    // =========================================================

    private Employee getLoggedInEmployee(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            return null;
        }


        return employeeRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElse(null);
    }


    // =========================================================
    // FILE EXTENSION
    // =========================================================

    private String getFileExtension(
            String fileName) {

        int lastDot =
                fileName.lastIndexOf('.');

        if (lastDot == -1) {
            return "";
        }

        return fileName
                .substring(lastDot)
                .toLowerCase();
    }


    // =========================================================
    // ALLOWED FILE TYPES
    // =========================================================

    private boolean isAllowedFileType(
            String extension) {

        return extension.equals(".pdf")
                || extension.equals(".doc")
                || extension.equals(".docx")
                || extension.equals(".jpg")
                || extension.equals(".jpeg")
                || extension.equals(".png");
    }


    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private EmployeeDocumentResponseDto mapToDto(
            EmployeeDocument document) {

        return EmployeeDocumentResponseDto
                .builder()
                .id(document.getId())
                .employeeId(document.getEmployeeId())
                .documentType(
                        document.getDocumentType()
                )
                .documentName(
                        document.getDocumentName()
                )
                .fileName(
                        document.getFileName()
                )
                .fileType(
                        document.getFileType()
                )
                .status(
                        document.getStatus()
                )
                .uploadedAt(
                        document.getUploadedAt()
                )
                .build();
    }
}