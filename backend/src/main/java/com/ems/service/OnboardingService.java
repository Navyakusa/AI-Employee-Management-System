package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.common.OnboardingStatus;
import com.ems.dto.OnboardingDto;
import com.ems.dto.OnboardingRequestDto;
import com.ems.entity.Candidate;
import com.ems.entity.Offer;
import com.ems.entity.Onboarding;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.OfferRepository;
import com.ems.repository.OnboardingRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final OfferRepository offerRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OnboardingService(
            OnboardingRepository onboardingRepository,
            OfferRepository offerRepository,
            CandidateRepository candidateRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.onboardingRepository = onboardingRepository;
        this.offerRepository = offerRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    // =========================================================
    // START ONBOARDING
    // =========================================================

    public ResponseEntity<ApiResponse<OnboardingDto>>
    startOnboarding(OnboardingRequestDto request) {

        try {

            // -------------------------------------------------
            // 1. Validate request
            // -------------------------------------------------

            if (request == null || request.getOfferId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer ID is required",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 2. Find offer
            // -------------------------------------------------

            Offer offer =
                    offerRepository
                            .findById(request.getOfferId())
                            .orElse(null);

            if (offer == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer not found",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 3. Offer must be ACCEPTED
            // -------------------------------------------------

            if (offer.getStatus() != OfferStatus.ACCEPTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Onboarding can start only after the offer is accepted",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 4. Prevent duplicate onboarding
            // -------------------------------------------------

            if (onboardingRepository
                    .existsByOfferId(offer.getOfferId())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Onboarding has already been started for this offer",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 5. Find candidate
            // -------------------------------------------------

            Candidate candidate =
                    candidateRepository
                            .findById(
                                    offer.getCandidateId()
                            )
                            .orElse(null);

            if (candidate == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate not found",
                                        null
                                )
                        );
            }


            // -------------------------------------------------
            // 6. Create onboarding
            // -------------------------------------------------

            Onboarding onboarding =
                    Onboarding.builder()
                            .offerId(
                                    offer.getOfferId()
                            )
                            .candidateId(
                                    candidate.getId()
                            )
                            .candidateName(
                                    candidate.getName()
                            )
                            .position(
                                    offer.getPosition()
                            )
                            .status(
                                    OnboardingStatus.STARTED
                            )
                            .build();


            Onboarding savedOnboarding =
                    onboardingRepository.save(onboarding);


            // -------------------------------------------------
            // 7. Find candidate's User account
            // -------------------------------------------------

            if (candidate.getEmail() != null
                    && !candidate.getEmail().isBlank()) {

                User candidateUser =
                        userRepository
                                .findByEmailIgnoreCase(
                                        candidate.getEmail()
                                )
                                .orElse(null);


                // -------------------------------------------------
                // 8. In-app notification + DB email template
                // -------------------------------------------------

                if (candidateUser != null) {

                    notificationService.createNotification(
                            candidateUser.getUserId(),
                            "Your onboarding process has been started",
                            "ONBOARDING_STARTED"
                    );
                }
            }


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Onboarding started successfully",
                                    mapToDto(savedOnboarding)
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to start onboarding: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET ALL ONBOARDING
    // =========================================================

    public ResponseEntity<ApiResponse<List<OnboardingDto>>>
    getAllOnboarding() {

        try {

            List<OnboardingDto> response =
                    onboardingRepository
                            .findAll()
                            .stream()
                            .map(this::mapToDto)
                            .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Onboarding records fetched successfully",
                            response
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch onboarding records: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET ONBOARDING BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<OnboardingDto>>
    getOnboardingById(Long onboardingId) {

        try {

            Onboarding onboarding =
                    onboardingRepository
                            .findById(onboardingId)
                            .orElse(null);

            if (onboarding == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Onboarding record not found",
                                        null
                                )
                        );
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Onboarding record fetched successfully",
                            mapToDto(onboarding)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch onboarding record: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private OnboardingDto mapToDto(
            Onboarding onboarding) {

        return OnboardingDto.builder()
                .onboardingId(
                        onboarding.getOnboardingId()
                )
                .offerId(
                        onboarding.getOfferId()
                )
                .candidateId(
                        onboarding.getCandidateId()
                )
                .candidateName(
                        onboarding.getCandidateName()
                )
                .position(
                        onboarding.getPosition()
                )
                .status(
                        onboarding.getStatus()
                )
                .startedAt(
                        onboarding.getStartedAt()
                )
                .completedAt(
                        onboarding.getCompletedAt()
                )
                .build();
    }
}