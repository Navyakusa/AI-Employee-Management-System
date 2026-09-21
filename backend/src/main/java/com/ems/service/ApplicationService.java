package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.CandidateReviewDto;
import com.ems.dto.InterviewEligibleApplicationDto;
import com.ems.dto.ShortlistedCandidateDto;
import com.ems.entity.AICandidateMatching;
import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.entity.User;
import com.ems.mapper.CandidateReviewMapper;
import com.ems.mapper.ShortlistedCandidateMapper;
import com.ems.repository.AICandidateMatchingRepository;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
import com.ems.repository.UserRepository;

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

    private final EmailNotificationService emailNotificationService;


    // =========================================================
    // HELPER
    // FIND CANDIDATE FOR APPLICATION
    // =========================================================
    //
    // Correct relationship:
    //
    // Application.candidateId -> Candidate.id
    //
    // Some older records may have been created using:
    //
    // Application.candidateId -> User.userId
    //
    // Therefore we support both.
    // =========================================================

    private Candidate findCandidateForApplication(
            Application application
    ) {

        if (application == null ||
                application.getCandidateId() == null) {

            return null;
        }

        Long candidateId =
                application.getCandidateId();

        // First: correct relationship
        // Application.candidateId -> Candidate.id

        Candidate candidate =
                candidateRepository
                        .findById(candidateId)
                        .orElse(null);

        if (candidate != null) {
            return candidate;
        }

        // Backward compatibility:
        // older application may contain User.userId

        User user =
                userRepository
                        .findById(candidateId)
                        .orElse(null);

        if (user != null &&
                user.getEmail() != null) {

            return candidateRepository
                    .findByEmailIgnoreCase(
                            user.getEmail()
                    )
                    .orElse(null);
        }

        return null;
    }


    // =========================================================
    // HELPER
    // FIND USER FROM CANDIDATE
    // =========================================================
    //
    // User is optional for recruiter candidate information.
    // A Candidate profile can exist without a login account.
    // =========================================================

    private User findUserForCandidate(
            Candidate candidate
    ) {

        if (candidate == null ||
                candidate.getEmail() == null ||
                candidate.getEmail().isBlank()) {

            return null;
        }

        return userRepository
                .findByEmailIgnoreCase(
                        candidate.getEmail()
                )
                .orElse(null);
    }


    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    applyForJob(
            Long jobId,
            String email
    ) {

        try {

            User user =
                    userRepository
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
                                        "Only candidates can apply for jobs",
                                        null
                                )
                        );
            }

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
                                        "Candidate profile not found",
                                        null
                                )
                        );
            }

            Job job =
                    jobRepository
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

            if (job.getStatus() == null ||
                    !job.getStatus()
                            .equalsIgnoreCase("OPEN")) {

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

            // Check correct Candidate ID
            boolean alreadyApplied =
                    applicationRepository
                            .findByCandidateIdAndJobId(
                                    candidate.getId(),
                                    jobId
                            )
                            .isPresent();

            // Also check old User ID records
            if (!alreadyApplied) {

                alreadyApplied =
                        applicationRepository
                                .findByCandidateIdAndJobId(
                                        user.getUserId(),
                                        jobId
                                )
                                .isPresent();
            }

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

            Application application =
                    new Application();

            // IMPORTANT:
            // New applications store Candidate.id.
            application.setCandidateId(
                    candidate.getId()
            );

            application.setJobId(jobId);

            application.setStatus(
                    ApplicationStatus.APPLIED
            );

            Application savedApplication =
                    applicationRepository.save(
                            application
                    );

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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

            User user =
                    userRepository
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
                                        "Candidate profile not found",
                                        null
                                )
                        );
            }

            List<Application> applications =
                    applicationRepository
                            .findByCandidateId(
                                    candidate.getId()
                            );

            // Backward compatibility for old records
            List<Application> oldApplications =
                    applicationRepository
                            .findByCandidateId(
                                    user.getUserId()
                            );

            for (Application oldApplication :
                    oldApplications) {

                boolean alreadyIncluded =
                        applications.stream()
                                .anyMatch(
                                        existing ->
                                                existing
                                                        .getApplicationId()
                                                        .equals(
                                                                oldApplication
                                                                        .getApplicationId()
                                                        )
                                );

                if (!alreadyIncluded) {
                    applications.add(
                            oldApplication
                    );
                }
            }

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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

            User user =
                    userRepository
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
                                        "Candidate profile not found",
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

            Candidate applicationCandidate =
                    findCandidateForApplication(
                            application
                    );

            if (applicationCandidate == null ||
                    !applicationCandidate
                            .getId()
                            .equals(candidate.getId())) {

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

            application.setStatus(
                    ApplicationStatus.WITHDRAWN
            );

            Application savedApplication =
                    applicationRepository.save(
                            application
                    );

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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
    // HR / RECRUITER
    // GET SHORTLISTED CANDIDATES
    // =========================================================

    public ResponseEntity<ApiResponse<List<ShortlistedCandidateDto>>>
    getShortlistedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.SHORTLISTED
                    );

            List<ShortlistedCandidateDto>
                    shortlistedCandidates =
                    new ArrayList<>();

            for (Application application :
                    applications) {

                Candidate candidate =
                        findCandidateForApplication(
                                application
                        );

                if (candidate == null) {
                    continue;
                }

                Job job =
                        jobRepository
                                .findById(
                                        application.getJobId()
                                )
                                .orElse(null);

                if (job == null) {
                    continue;
                }

                /*
                 * User is optional here.
                 *
                 * The Candidate can exist without
                 * a login account.
                 */
                User user =
                        findUserForCandidate(
                                candidate
                        );

                Resume resume =
                        resumeRepository
                                .findFirstByCandidateIdOrderByIdDesc(
                                        candidate.getId()
                                )
                                .orElse(null);

                AICandidateMatching aiMatching =
                        aiCandidateMatchingRepository
                                .findByCandidateIdAndJobId(
                                        candidate.getId(),
                                        job.getId()
                                )
                                .orElse(null);

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

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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
    // HR / RECRUITER
    // CANDIDATE REVIEW
    // =========================================================

    public ResponseEntity<ApiResponse<CandidateReviewDto>>
    getCandidateReview(
            Long applicationId
    ) {

        try {

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

            // IMPORTANT:
            // Application.candidateId -> Candidate.id
            Candidate candidate =
                    findCandidateForApplication(
                            application
                    );

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

            /*
             * User is OPTIONAL.
             *
             * Rahul has a Candidate record but no User record.
             * Therefore we do not fail the review request.
             */
            User user =
                    findUserForCandidate(
                            candidate
                    );

            Job job =
                    jobRepository
                            .findById(
                                    application.getJobId()
                            )
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

            Resume resume =
                    resumeRepository
                            .findFirstByCandidateIdOrderByIdDesc(
                                    candidate.getId()
                            )
                            .orElse(null);

            AICandidateMatching aiMatching =
                    aiCandidateMatchingRepository
                            .findByCandidateIdAndJobId(
                                    candidate.getId(),
                                    job.getId()
                            )
                            .orElse(null);

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

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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
    // HR / RECRUITER
    // SHORTLIST CANDIDATE
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    shortlistCandidate(
            Long candidateId,
            Long jobId
    ) {

        try {

            Candidate candidate =
                    candidateRepository
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

            User user =
                    findUserForCandidate(
                            candidate
                    );

            Job job =
                    jobRepository
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

            /*
             * Correct relationship:
             * Candidate.id
             */
            Application application =
                    applicationRepository
                            .findByCandidateIdAndJobId(
                                    candidate.getId(),
                                    jobId
                            )
                            .orElse(null);

            /*
             * Backward compatibility for old data
             * where User.userId was stored.
             */
            if (application == null &&
                    user != null) {

                application =
                        applicationRepository
                                .findByCandidateIdAndJobId(
                                        user.getUserId(),
                                        jobId
                                )
                                .orElse(null);
            }

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

            if (application.getStatus() ==
                    ApplicationStatus.SHORTLISTED) {

                return ResponseEntity.ok(
                        new ApiResponse<>(
                                true,
                                "Candidate is already shortlisted",
                                application
                        )
                );
            }

            // Normalize new/updated records
            application.setCandidateId(
                    candidate.getId()
            );

            application.setStatus(
                    ApplicationStatus.SHORTLISTED
            );

            Application savedApplication =
                    applicationRepository.save(
                            application
                    );

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
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


    // =========================================================
    // HR / HIRING MANAGER
    // UPDATE APPLICATION STATUS + EMAIL
    // =========================================================

    public ResponseEntity<ApiResponse<Application>>
    updateApplicationStatus(
            Long applicationId,
            ApplicationStatus newStatus
    ) {

        try {

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

            if (newStatus !=
                    ApplicationStatus.ACCEPTED &&
                    newStatus !=
                            ApplicationStatus.REJECTED) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only ACCEPTED or REJECTED status can be updated using this endpoint",
                                        null
                                )
                        );
            }

            Candidate candidate =
                    findCandidateForApplication(
                            application
                    );

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

            Job job =
                    jobRepository
                            .findById(
                                    application.getJobId()
                            )
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

            application.setStatus(
                    newStatus
            );

            Application savedApplication =
                    applicationRepository.save(
                            application
                    );

            /*
             * Email is sent directly to Candidate.email.
             *
             * Candidate does not need a User account.
             */

            if (newStatus ==
                    ApplicationStatus.ACCEPTED) {

                emailNotificationService
                        .sendApplicationAcceptedEmail(
                                candidate.getEmail(),
                                candidate.getName(),
                                job.getTitle()
                        );

            } else {

                emailNotificationService
                        .sendApplicationRejectedEmail(
                                candidate.getEmail(),
                                candidate.getName(),
                                job.getTitle()
                        );
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Application status updated and email notification sent successfully",
                            savedApplication
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to update application status: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // RECRUITER
    // APPLICATIONS ELIGIBLE FOR INTERVIEW
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<InterviewEligibleApplicationDto>>>
    getApplicationsEligibleForInterview() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.SHORTLISTED
                    );

            List<InterviewEligibleApplicationDto>
                    result =
                    new ArrayList<>();

            for (Application application :
                    applications) {

                Candidate candidate =
                        findCandidateForApplication(
                                application
                        );

                if (candidate == null) {
                    continue;
                }

                Job job =
                        jobRepository
                                .findById(
                                        application.getJobId()
                                )
                                .orElse(null);

                if (job == null) {
                    continue;
                }

                InterviewEligibleApplicationDto dto =
                        new InterviewEligibleApplicationDto(
                                application.getApplicationId(),
                                candidate.getId(),
                                candidate.getName(),
                                job.getId(),
                                job.getTitle()
                        );

                result.add(dto);
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Applications eligible for interview scheduling fetched successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch applications eligible for interview: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
}