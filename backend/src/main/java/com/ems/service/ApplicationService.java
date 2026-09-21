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


    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    applyForJob(
            Long jobId,
            String email
    ) {

        try {

            // -------------------------------------------------
            // 1. Find logged-in user
            // -------------------------------------------------

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 2. Verify candidate role
            // -------------------------------------------------

            if (user.getRole() == null ||
                    !user.getRole()
                            .equalsIgnoreCase("CANDIDATE")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only candidates can apply for jobs",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 3. Find candidate profile
            // -------------------------------------------------

            Candidate candidate = candidateRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (candidate == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate profile not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 4. Find job
            // -------------------------------------------------

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

            // -------------------------------------------------
            // 5. Check job status
            // -------------------------------------------------

            if (job.getStatus() == null ||
                    !job.getStatus().equalsIgnoreCase("OPEN")) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "This job is not open for applications",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 6. Prevent duplicate application
            //
            // Application.candidateId = User.userId
            // -------------------------------------------------

            boolean alreadyApplied =
                    applicationRepository
                            .findByCandidateIdAndJobId(
                                    user.getUserId(),
                                    jobId
                            )
                            .isPresent();

            if (alreadyApplied) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You have already applied for this job",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 7. Create application
            // -------------------------------------------------

            Application application = new Application();

            application.setCandidateId(
                    user.getUserId()
            );

            application.setJobId(jobId);

            application.setStatus(
                    ApplicationStatus.APPLIED
            );

            Application savedApplication =
                    applicationRepository.save(application);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Job application submitted successfully",
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
                                    "Failed to apply for job: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // CANDIDATE - GET MY APPLICATIONS
    // =========================================================

    public ResponseEntity<ApiResponse<List<Application>>>
    getMyApplications(
            String email
    ) {

        try {

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            if (user.getRole() == null ||
                    !user.getRole()
                            .equalsIgnoreCase("CANDIDATE")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only candidates can view their applications",
                                        null
                                )
                        );
            }

            List<Application> applications =
                    applicationRepository
                            .findByCandidateId(
                                    user.getUserId()
                            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate applications retrieved successfully",
                            applications
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch applications: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    withdrawApplication(
            Long applicationId,
            String email
    ) {

        try {

            User user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "User not found",
                                        null
                                )
                        );
            }

            if (user.getRole() == null ||
                    !user.getRole()
                            .equalsIgnoreCase("CANDIDATE")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only candidates can withdraw applications",
                                        null
                                )
                        );
            }

            Application application =
                    applicationRepository
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

            // -------------------------------------------------
            // Security:
            // Candidate can withdraw ONLY their own application
            // -------------------------------------------------

            if (!application.getCandidateId()
                    .equals(user.getUserId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not allowed to withdraw this application",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Do not withdraw already processed applications
            // -------------------------------------------------

            if (application.getStatus() ==
                    ApplicationStatus.SHORTLISTED) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Shortlisted applications cannot be withdrawn",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Update status
            // -------------------------------------------------

            application.setStatus(
                    ApplicationStatus.WITHDRAWN
            );

            Application savedApplication =
                    applicationRepository.save(application);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Application withdrawn successfully",
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
                                    "Failed to withdraw application: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // EXISTING HR / RECRUITER
    // GET SHORTLISTED CANDIDATES
    // =========================================================

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


    // =========================================================
    // EXISTING HR / RECRUITER
    // CANDIDATE REVIEW
    // =========================================================

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

            if (application.getStatus() !=
                    ApplicationStatus.SHORTLISTED) {

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


    // =========================================================
    // EXISTING HR / RECRUITER
    // SHORTLIST CANDIDATE
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    shortlistCandidate(
            Long candidateId,
            Long jobId
    ) {

        try {

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