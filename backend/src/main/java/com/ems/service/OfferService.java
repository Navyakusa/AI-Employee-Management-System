package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.dto.OfferDto;
import com.ems.dto.OfferStatsDto;
import com.ems.entity.Candidate;
import com.ems.entity.Offer;
import com.ems.repository.CandidateRepository;
import com.ems.repository.OfferRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import com.ems.entity.User;
import com.ems.repository.UserRepository;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    public OfferService(
            OfferRepository offerRepository,
            CandidateRepository candidateRepository, UserRepository userRepository, NotificationService notificationService
    ) {
        this.offerRepository = offerRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    // ============================================================
    // CREATE OFFER
    // ============================================================

    public ResponseEntity<ApiResponse<OfferDto>> createOffer(
            OfferDto dto
    ) {

        try {

            if (dto.getCandidateName() == null ||
                    dto.getCandidateName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate name is required",
                                        null
                                )
                        );
            }

            if (dto.getPosition() == null ||
                    dto.getPosition().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Position is required",
                                        null
                                )
                        );
            }

            if (dto.getSalary() == null ||
                    dto.getSalary() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Valid salary is required",
                                        null
                                )
                        );
            }

            Offer offer = new Offer();

            offer.setCandidateId(
                    dto.getCandidateId()
            );

            offer.setCandidateName(
                    dto.getCandidateName().trim()
            );

            offer.setPosition(
                    dto.getPosition().trim()
            );

            offer.setSalary(
                    dto.getSalary()
            );

            offer.setJoiningDate(
                    dto.getJoiningDate()
            );

            offer.setLocation(
                    dto.getLocation()
            );

            offer.setEmploymentType(
                    dto.getEmploymentType()
            );

            offer.setStatus(
                    OfferStatus.PENDING
            );

            Offer savedOffer =
                    offerRepository.save(offer);

            String generatedCode =
                    "OFF-" +
                            java.util.UUID.randomUUID()
                                    .toString()
                                    .substring(0, 8)
                                    .toUpperCase();

            savedOffer.setOfferCode(
                    generatedCode
            );

            savedOffer =
                    offerRepository.save(savedOffer);
            Candidate candidate =
                    candidateRepository
                            .findById(savedOffer.getCandidateId())
                            .orElse(null);

            if (candidate != null &&
                    candidate.getEmail() != null) {

                User candidateUser =
                        userRepository
                                .findByEmailIgnoreCase(
                                        candidate.getEmail()
                                )
                                .orElse(null);

                if (candidateUser != null) {

                    notificationService.createNotification(
                            candidateUser.getUserId(),
                            "An offer has been generated for "
                                    + savedOffer.getPosition(),
                            "OFFER_GENERATED"
                    );
                }
            }
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Offer created successfully",
                                    convertToDto(savedOffer)
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to create offer: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // GET ALL OFFERS
    // HR
    // ============================================================

    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getAllOffers() {

        try {

            List<OfferDto> offers =
                    offerRepository
                            .findAll()
                            .stream()
                            .map(this::convertToDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offers fetched successfully",
                            offers
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // GET MY OFFERS
    // CANDIDATE
    // ============================================================

    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getOffersForCandidateEmail(
            String email
    ) {

        try {

            Candidate candidate =
                    candidateRepository
                            .findByEmailIgnoreCase(email)
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

            List<OfferDto> offers =
                    offerRepository
                            .findByCandidateId(
                                    candidate.getId()
                            )
                            .stream()
                            // PENDING means draft.
                            // Candidate should only see sent offers.
                            .filter(
                                    offer ->
                                            offer.getStatus()
                                                    != OfferStatus.PENDING
                            )
                            .map(this::convertToDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offers fetched successfully",
                            offers
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch candidate offers: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // GET OFFER BY ID
    // ============================================================

    public ResponseEntity<ApiResponse<OfferDto>>
    getOfferById(
            Long offerId
    ) {

        try {

            Offer offer =
                    offerRepository
                            .findById(offerId)
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Offer not found"
                                            )
                            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offer fetched successfully",
                            convertToDto(offer)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // SEARCH
    // ============================================================

    public ResponseEntity<ApiResponse<List<OfferDto>>>
    searchOffers(
            String query
    ) {

        try {

            List<OfferDto> offers =
                    offerRepository
                            .findByCandidateNameContainingIgnoreCaseOrPositionContainingIgnoreCaseOrOfferCodeContainingIgnoreCase(
                                    query,
                                    query,
                                    query
                            )
                            .stream()
                            .map(this::convertToDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offers searched successfully",
                            offers
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // FILTER BY STATUS
    // ============================================================

    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getByStatus(
            OfferStatus status
    ) {

        try {

            List<OfferDto> offers =
                    offerRepository
                            .findByStatus(status)
                            .stream()
                            .map(this::convertToDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offers fetched successfully",
                            offers
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // SEND OFFER
    // HR
    // ============================================================

    public ResponseEntity<ApiResponse<OfferDto>>
    sendOffer(
            Long offerId
    ) {

        try {

            Offer offer =
                    getOfferEntity(offerId);

            if (offer.getStatus() ==
                    OfferStatus.ACCEPTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Accepted offer cannot be sent again",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.REJECTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Rejected offer cannot be sent",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.SENT) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer is already sent",
                                        null
                                )
                        );
            }

            offer.setStatus(
                    OfferStatus.SENT
            );

            Offer updated =
                    offerRepository.save(offer);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offer sent successfully",
                            convertToDto(updated)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // ACCEPT OFFER
    // CANDIDATE
    // ============================================================

    public ResponseEntity<ApiResponse<OfferDto>>
    acceptOffer(
            Long offerId,
            String email
    ) {

        try {

            Candidate candidate =
                    candidateRepository
                            .findByEmailIgnoreCase(email)
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

            Offer offer =
                    getOfferEntity(offerId);

            // IMPORTANT:
            // Candidate can only accept their own offer.
            if (offer.getCandidateId() == null ||
                    !offer.getCandidateId()
                            .equals(candidate.getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to accept this offer",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.ACCEPTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer is already accepted",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.REJECTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Rejected offer cannot be accepted",
                                        null
                                )
                        );
            }

            if (offer.getStatus() !=
                    OfferStatus.SENT) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer must be sent before it can be accepted",
                                        null
                                )
                        );
            }

            offer.setStatus(
                    OfferStatus.ACCEPTED
            );

            Offer updated =
                    offerRepository.save(offer);
            List<User> recruitmentUsers =
                    userRepository.findAll();

            for (User recruitmentUser : recruitmentUsers) {

                if (recruitmentUser.getRole() == null) {
                    continue;
                }

                String role =
                        recruitmentUser
                                .getRole()
                                .toUpperCase();

                if (role.equals("HR") ||
                        role.equals("RECRUITER") ||
                        role.equals("HIRING_MANAGER") ||
                        role.equals("SUPER_ADMIN")) {

                    notificationService.createNotification(
                            recruitmentUser.getUserId(),
                            "Candidate "
                                    + candidate.getName()
                                    + " accepted the offer for "
                                    + updated.getPosition(),
                            "OFFER_ACCEPTED"
                    );
                }
            }
            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offer accepted successfully",
                            convertToDto(updated)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // REJECT OFFER
    // CANDIDATE
    // ============================================================

    public ResponseEntity<ApiResponse<OfferDto>>
    rejectOffer(
            Long offerId,
            String email
    ) {

        try {

            Candidate candidate =
                    candidateRepository
                            .findByEmailIgnoreCase(email)
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

            Offer offer =
                    getOfferEntity(offerId);

            // IMPORTANT:
            // Candidate can only reject their own offer.
            if (offer.getCandidateId() == null ||
                    !offer.getCandidateId()
                            .equals(candidate.getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to reject this offer",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.REJECTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer is already rejected",
                                        null
                                )
                        );
            }

            if (offer.getStatus() ==
                    OfferStatus.ACCEPTED) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Accepted offer cannot be rejected",
                                        null
                                )
                        );
            }

            if (offer.getStatus() !=
                    OfferStatus.SENT) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Offer must be sent before it can be rejected",
                                        null
                                )
                        );
            }

            offer.setStatus(
                    OfferStatus.REJECTED
            );

            Offer updated =
                    offerRepository.save(offer);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offer rejected successfully",
                            convertToDto(updated)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // OFFER STATISTICS
    // ============================================================

    public ResponseEntity<ApiResponse<OfferStatsDto>>
    getStats() {

        try {

            OfferStatsDto stats =
                    OfferStatsDto.builder()

                            .totalOffers(
                                    offerRepository.count()
                            )

                            .pendingOffers(
                                    offerRepository.countByStatus(
                                            OfferStatus.PENDING
                                    )
                            )

                            .sentOffers(
                                    offerRepository.countByStatus(
                                            OfferStatus.SENT
                                    )
                            )

                            .acceptedOffers(
                                    offerRepository.countByStatus(
                                            OfferStatus.ACCEPTED
                                    )
                            )

                            .rejectedOffers(
                                    offerRepository.countByStatus(
                                            OfferStatus.REJECTED
                                    )
                            )

                            .build();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Offer statistics fetched successfully",
                            stats
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // ============================================================
    // HELPER
    // ============================================================

    private Offer getOfferEntity(
            Long offerId
    ) {

        return offerRepository
                .findById(offerId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Offer not found"
                                )
                );
    }


    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private OfferDto convertToDto(
            Offer offer
    ) {

        return OfferDto.builder()

                .offerId(
                        offer.getOfferId()
                )

                .offerCode(
                        offer.getOfferCode()
                )

                .candidateId(
                        offer.getCandidateId()
                )

                .candidateName(
                        offer.getCandidateName()
                )

                .position(
                        offer.getPosition()
                )

                .salary(
                        offer.getSalary()
                )

                .joiningDate(
                        offer.getJoiningDate()
                )

                .location(
                        offer.getLocation()
                )

                .employmentType(
                        offer.getEmploymentType()
                )

                .status(
                        offer.getStatus()
                )

                .offerLetterUrl(
                        offer.getOfferLetterUrl()
                )

                .build();
    }
}