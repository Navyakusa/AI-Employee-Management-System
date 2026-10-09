package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.common.OnboardingStatus;
import com.ems.dto.OnboardingDto;
import com.ems.dto.OnboardingRequestDto;
import com.ems.entity.Candidate;
import com.ems.entity.Employee;
import com.ems.entity.Offer;
import com.ems.entity.Onboarding;
import com.ems.entity.OnboardingDocument;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.OfferRepository;
import com.ems.repository.OnboardingDocumentRepository;
import com.ems.repository.OnboardingRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final OfferRepository offerRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmployeeRepository employeeRepository;
    private final OnboardingDocumentRepository onboardingDocumentRepository;

    public OnboardingService(
            OnboardingRepository onboardingRepository,
            OfferRepository offerRepository,
            CandidateRepository candidateRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            EmployeeRepository employeeRepository,
            OnboardingDocumentRepository onboardingDocumentRepository) {

        this.onboardingRepository = onboardingRepository;
        this.offerRepository = offerRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.employeeRepository = employeeRepository;
        this.onboardingDocumentRepository = onboardingDocumentRepository;
    }

    // =========================================================
    // START ONBOARDING
    // =========================================================

    public ResponseEntity<ApiResponse<OnboardingDto>> startOnboarding(
            OnboardingRequestDto request) {

        if (request == null || request.getOfferId() == null) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Offer ID is required", null));
        }

        Offer offer = offerRepository.findById(request.getOfferId())
                .orElse(null);

        if (offer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(false, "Offer not found", null));
        }

        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Onboarding can start only after the offer is accepted",
                            null));
        }

        if (onboardingRepository.existsByOfferId(offer.getOfferId())) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Onboarding has already been started for this offer",
                            null));
        }

        Candidate candidate = candidateRepository
                .findById(offer.getCandidateId())
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(false, "Candidate not found", null));
        }

        Onboarding onboarding = Onboarding.builder()
                .offerId(offer.getOfferId())
                .candidateId(candidate.getId())
                .candidateName(candidate.getName())
                .position(offer.getPosition())
                .status(OnboardingStatus.STARTED)
                .build();

        Onboarding savedOnboarding = onboardingRepository.save(onboarding);

        if (candidate.getEmail() != null
                && !candidate.getEmail().isBlank()) {

            User candidateUser = userRepository
                    .findByEmailIgnoreCase(candidate.getEmail())
                    .orElse(null);

            if (candidateUser != null) {
                notificationService.createNotification(
                        candidateUser.getUserId(),
                        "Your onboarding process has been started",
                        "ONBOARDING_STARTED");
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Onboarding started successfully",
                        mapToDto(savedOnboarding)));
    }

    // =========================================================
    // GET ALL ONBOARDING
    // =========================================================

    public ResponseEntity<ApiResponse<List<OnboardingDto>>> getAllOnboarding() {

        List<OnboardingDto> response = onboardingRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Onboarding records fetched successfully",
                        response));
    }

    // =========================================================
    // GET ONBOARDING BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<OnboardingDto>> getOnboardingById(
            Long onboardingId) {

        Onboarding onboarding = onboardingRepository
                .findById(onboardingId)
                .orElse(null);

        if (onboarding == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                            false,
                            "Onboarding record not found",
                            null));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Onboarding record fetched successfully",
                        mapToDto(onboarding)));
    }

    // =========================================================
    // COMPLETE ONBOARDING AND ACTIVATE EMPLOYEE
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<OnboardingDto>> completeOnboarding(
            Long onboardingId) {

        Onboarding onboarding = onboardingRepository
                .findById(onboardingId)
                .orElse(null);

        if (onboarding == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                            false,
                            "Onboarding record not found",
                            null));
        }

        if (onboarding.getStatus() == OnboardingStatus.COMPLETED) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Onboarding is already completed",
                            null));
        }

        Candidate candidate = candidateRepository
                .findById(onboarding.getCandidateId())
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                            false,
                            "Candidate not found",
                            null));
        }

        if (candidate.getEmail() == null
                || candidate.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Candidate email is missing",
                            null));
        }

        Offer offer = offerRepository
                .findById(onboarding.getOfferId())
                .orElse(null);

        if (offer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                            false,
                            "Associated offer not found",
                            null));
        }

        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "The associated offer must be accepted",
                            null));
        }

        List<OnboardingDocument> documents =
                onboardingDocumentRepository.findByOnboardingId(onboardingId);

        if (documents.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Upload onboarding documents before completing onboarding",
                            null));
        }

        boolean allVerified = documents.stream()
                .allMatch(document ->
                        "VERIFIED".equalsIgnoreCase(document.getStatus()));

        if (!allVerified) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "All uploaded onboarding documents must be verified",
                            null));
        }

        // Reuse the existing employee if one already exists for this email.
        Employee employee = employeeRepository
                .findByEmailIgnoreCase(candidate.getEmail())
                .orElse(null);

        if (employee == null) {
            employee = new Employee();
            employee.setEmployeeId(
                    "EMP-" + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase());
            employee.setName(candidate.getName());
            employee.setEmail(candidate.getEmail());
            employee.setPhone(candidate.getPhone());
        }

        // Use the accepted offer as the source for employment details.
        employee.setDesignation(offer.getPosition());
        employee.setJoiningDate(offer.getJoiningDate());
        employee.setLocation(offer.getLocation());
        employee.setEmploymentType(offer.getEmploymentType());
        employee.setStatus("ACTIVE");

        employeeRepository.save(employee);

        onboarding.setStatus(OnboardingStatus.COMPLETED);
        onboarding.setCompletedAt(LocalDateTime.now());

        Onboarding savedOnboarding = onboardingRepository.save(onboarding);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Onboarding completed and employee activated successfully",
                        mapToDto(savedOnboarding)));
    }

    // =========================================================
    // ENTITY TO DTO
    // =========================================================

    private OnboardingDto mapToDto(Onboarding onboarding) {

        return OnboardingDto.builder()
                .onboardingId(onboarding.getOnboardingId())
                .offerId(onboarding.getOfferId())
                .candidateId(onboarding.getCandidateId())
                .candidateName(onboarding.getCandidateName())
                .position(onboarding.getPosition())
                .status(onboarding.getStatus())
                .startedAt(onboarding.getStartedAt())
                .completedAt(onboarding.getCompletedAt())
                .build();
    }
}