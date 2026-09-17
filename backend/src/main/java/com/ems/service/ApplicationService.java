package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.CandidateReviewDto;
import com.ems.dto.ShortlistedCandidateDto;
import com.ems.entity.*;
import com.ems.mapper.CandidateReviewMapper;
import com.ems.mapper.ShortlistedCandidateMapper;
import com.ems.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;
    private final AICandidateMatchingRepository aiCandidateMatchingRepository;
    private final ShortlistedCandidateMapper shortlistedCandidateMapper;
    private final CandidateReviewMapper candidateReviewMapper;

    public ResponseEntity<ApiResponse<List<ShortlistedCandidateDto>>>
    getShortlistedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.SHORTLISTED
                    );

            List<ShortlistedCandidateDto> shortlistedCandidates =
                    new ArrayList<>();

            for (Application application : applications) {

                /*
                 * Application.candidateId currently points
                 * to User.userId
                 */
                User user = userRepository
                        .findById(application.getCandidateId())
                        .orElse(null);

                Job job = jobRepository
                        .findById(application.getJobId())
                        .orElse(null);

                if (user == null || job == null) {
                    continue;
                }

                /*
                 * Only CANDIDATE users should appear
                 */
                if (user.getRole() == null ||
                        !user.getRole()
                                .equalsIgnoreCase("CANDIDATE")) {
                    continue;
                }

                /*
                 * Candidate profile is currently resolved
                 * through the user's email.
                 */
                Candidate candidate = candidateRepository
                        .findByEmailIgnoreCase(user.getEmail())
                        .orElse(null);

                Resume resume = null;
                AICandidateMatching aiMatching = null;

                /*
                 * Resume and AI tables use Candidate.id,
                 * not User.userId.
                 */
                if (candidate != null) {

                    resume = resumeRepository
                            .findFirstByCandidateIdOrderByIdDesc(
                                    candidate.getId()
                            )
                            .orElse(null);

                    aiMatching =
                            aiCandidateMatchingRepository
                                    .findByCandidateIdAndJobId(
                                            candidate.getId(),
                                            job.getId()
                                    )
                                    .orElse(null);
                }

                /*
                 * Entity -> DTO mapping
                 */
                ShortlistedCandidateDto dto =
                        shortlistedCandidateMapper.toDto(
                                application,
                                user,
                                candidate,
                                job,
                                resume,
                                aiMatching
                        );

                shortlistedCandidates.add(dto);
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Shortlisted candidates fetched successfully",
                            shortlistedCandidates
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch shortlisted candidates: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
    public ResponseEntity<ApiResponse<CandidateReviewDto>>
    getCandidateReview(Long applicationId) {

        try {

            Application application = applicationRepository
                    .findById(applicationId)
                    .orElse(null);

            if (application == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application not found",
                                        null
                                )
                        );
            }

            // Review endpoint is only for shortlisted applications
            if (application.getStatus() != ApplicationStatus.SHORTLISTED) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate is not shortlisted",
                                        null
                                )
                        );
            }

            User user = userRepository
                    .findById(application.getCandidateId())
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate user not found",
                                        null
                                )
                        );
            }

            if (user.getRole() == null ||
                    !user.getRole().equalsIgnoreCase("CANDIDATE")) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application does not belong to a candidate",
                                        null
                                )
                        );
            }

            Job job = jobRepository
                    .findById(application.getJobId())
                    .orElse(null);

            if (job == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Job not found",
                                        null
                                )
                        );
            }

            Candidate candidate = candidateRepository
                    .findByEmailIgnoreCase(user.getEmail())
                    .orElse(null);

            Resume resume = null;
            AICandidateMatching aiMatching = null;

            if (candidate != null) {

                resume = resumeRepository
                        .findFirstByCandidateIdOrderByIdDesc(
                                candidate.getId()
                        )
                        .orElse(null);

                aiMatching = aiCandidateMatchingRepository
                        .findByCandidateIdAndJobId(
                                candidate.getId(),
                                job.getId()
                        )
                        .orElse(null);
            }

            CandidateReviewDto review =
                    candidateReviewMapper.toDto(
                            application,
                            user,
                            candidate,
                            job,
                            resume,
                            aiMatching
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate review fetched successfully",
                            review
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch candidate review: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
    public ResponseEntity<ApiResponse<Application>>
    shortlistCandidate(
            Long candidateId,
            Long jobId
    ) {

        try {

            // ============================================
            // 1. AI Screening candidateId = Candidate.id
            // ============================================

            Candidate candidate = candidateRepository
                    .findById(candidateId)
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


            // ============================================
            // 2. Find User through candidate email
            // ============================================

            User user = userRepository
                    .findByEmailIgnoreCase(
                            candidate.getEmail()
                    )
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate user account not found",
                                        null
                                )
                        );
            }


            // ============================================
            // 3. Verify role
            // ============================================

            if (user.getRole() == null ||
                    !user.getRole()
                            .equalsIgnoreCase("CANDIDATE")) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User is not a candidate",
                                        null
                                )
                        );
            }


            // ============================================
            // 4. Verify Job
            // ============================================

            Job job = jobRepository
                    .findById(jobId)
                    .orElse(null);

            if (job == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Job not found",
                                        null
                                )
                        );
            }


            // ============================================
            // 5. Find Application
            //
            // IMPORTANT:
            // Application.candidateId = User.userId
            // ============================================

            Application application =
                    applicationRepository
                            .findByCandidateIdAndJobId(
                                    user.getUserId(),
                                    jobId
                            )
                            .orElse(null);

            if (application == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application not found for candidate and job",
                                        null
                                )
                        );
            }


            // ============================================
            // 6. Already shortlisted
            // ============================================

            if (application.getStatus()
                    == ApplicationStatus.SHORTLISTED) {

                return ResponseEntity.ok(
                        new ApiResponse<>(
                                true,
                                "Candidate is already shortlisted",
                                application
                        )
                );
            }


            // ============================================
            // 7. Update application status
            // ============================================

            application.setStatus(
                    ApplicationStatus.SHORTLISTED
            );

            Application savedApplication =
                    applicationRepository.save(application);


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate shortlisted successfully",
                            savedApplication
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to shortlist candidate: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
}