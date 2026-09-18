package com.ems.service;

import com.ems.dto.CandidateDashboardApplicationDto;
import com.ems.dto.CandidateDashboardDto;
import com.ems.dto.CandidateDashboardInterviewDto;
import com.ems.dto.CandidateDashboardJobDto;
import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateDashboardService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final JobRepository jobRepository;

    public CandidateDashboardDto getDashboard(String email) {

        /*
         * Find the candidate using the email stored in the
         * authenticated JWT.
         */
        Candidate candidate = candidateRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Candidate profile not found for authenticated user"
                        )
                );

        Long candidateId = candidate.getId();

        /*
         * ---------------------------------------------------------
         * 1. TOTAL APPLICATIONS
         * ---------------------------------------------------------
         */
        long totalApplications =
                applicationRepository.countByCandidateId(candidateId);

        /*
         * ---------------------------------------------------------
         * 2. TOTAL OFFERS
         * ---------------------------------------------------------
         */
        long totalOffers =
                offerRepository.countByCandidateId(candidateId);

        /*
         * ---------------------------------------------------------
         * 3. CANDIDATE INTERVIEWS
         * ---------------------------------------------------------
         */
        List<Interview> candidateInterviews =
                interviewRepository.findByCandidateId(candidateId);

        LocalDateTime now = LocalDateTime.now();

        /*
         * Only interviews whose date/time is in the future
         * are counted as upcoming.
         */
        List<Interview> upcomingInterviews =
                candidateInterviews.stream()
                        .filter(interview ->
                                interview.getInterviewDateTime() != null
                                        && interview.getInterviewDateTime()
                                        .isAfter(now)
                        )
                        .sorted(
                                Comparator.comparing(
                                        Interview::getInterviewDateTime
                                )
                        )
                        .toList();

        long upcomingInterviewCount =
                upcomingInterviews.size();

        /*
         * ---------------------------------------------------------
         * 4. NEXT UPCOMING INTERVIEW
         * ---------------------------------------------------------
         */
        CandidateDashboardInterviewDto upcomingInterview = null;

        if (!upcomingInterviews.isEmpty()) {

            Interview interview =
                    upcomingInterviews.get(0);

            upcomingInterview =
                    CandidateDashboardInterviewDto.builder()
                            .interviewId(
                                    interview.getInterviewId()
                            )
                            .jobId(
                                    interview.getJobId()
                            )
                            .interviewDateTime(
                                    interview.getInterviewDateTime()
                            )
                            .interviewMode(
                                    interview.getInterviewMode()
                            )
                            .meetingLink(
                                    interview.getMeetingLink()
                            )
                            .location(
                                    interview.getLocation()
                            )
                            .notes(
                                    interview.getNotes()
                            )
                            .status(
                                    interview.getStatus() != null
                                            ? interview.getStatus().name()
                                            : null
                            )
                            .build();
        }

        /*
         * ---------------------------------------------------------
         * 5. RECENT APPLICATIONS
         * ---------------------------------------------------------
         */
        List<Application> applications =
                applicationRepository
                        .findTop5ByCandidateIdOrderByAppliedAtDesc(
                                candidateId
                        );

        /*
         * Get all job IDs used by the recent applications.
         */
        Set<Long> applicationJobIds =
                applications.stream()
                        .map(Application::getJobId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        /*
         * Load the corresponding jobs in one repository call.
         */
        Map<Long, Job> applicationJobs =
                jobRepository.findAllById(applicationJobIds)
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        Job::getId,
                                        Function.identity()
                                )
                        );

        /*
         * Convert applications into dashboard DTOs.
         */
        List<CandidateDashboardApplicationDto> recentApplications =
                applications.stream()
                        .map(application -> {

                            Job job =
                                    applicationJobs.get(
                                            application.getJobId()
                                    );

                            return CandidateDashboardApplicationDto
                                    .builder()
                                    .applicationId(
                                            application.getApplicationId()
                                    )
                                    .jobId(
                                            application.getJobId()
                                    )
                                    .jobTitle(
                                            job != null
                                                    ? job.getTitle()
                                                    : null
                                    )
                                    .department(
                                            job != null
                                                    ? job.getDepartment()
                                                    : null
                                    )
                                    .location(
                                            job != null
                                                    ? job.getLocation()
                                                    : null
                                    )
                                    .status(
                                            application.getStatus() != null
                                                    ? application
                                                    .getStatus()
                                                    .name()
                                                    : null
                                    )
                                    .appliedAt(
                                            application.getAppliedAt()
                                    )
                                    .build();
                        })
                        .toList();

        /*
         * ---------------------------------------------------------
         * 6. PROFILE COMPLETION
         * ---------------------------------------------------------
         */
        int profileCompletionPercentage =
                calculateProfileCompletion(candidate);

        /*
         * ---------------------------------------------------------
         * 7. RECOMMENDED JOBS
         * ---------------------------------------------------------
         */
        List<CandidateDashboardJobDto> recommendedJobs =
                getRecommendedJobs(candidateId);

        /*
         * ---------------------------------------------------------
         * 8. FINAL DASHBOARD RESPONSE
         * ---------------------------------------------------------
         */
        return CandidateDashboardDto.builder()
                .candidateId(
                        candidate.getId()
                )
                .candidateName(
                        candidate.getName()
                )
                .email(
                        candidate.getEmail()
                )
                .totalApplications(
                        totalApplications
                )
                .upcomingInterviews(
                        upcomingInterviewCount
                )
                .totalOffers(
                        totalOffers
                )
                .profileCompletionPercentage(
                        profileCompletionPercentage
                )
                .recentApplications(
                        recentApplications
                )
                .upcomingInterview(
                        upcomingInterview
                )
                .recommendedJobs(
                        recommendedJobs
                )
                .build();
    }

    /*
     * =============================================================
     * PROFILE COMPLETION
     * =============================================================
     */
    private int calculateProfileCompletion(
            Candidate candidate
    ) {

        /*
         * Candidate fields used for the profile completion
         * percentage.
         */
        int totalFields = 12;
        int completedFields = 0;

        if (hasText(candidate.getName())) {
            completedFields++;
        }

        if (hasText(candidate.getEmail())) {
            completedFields++;
        }

        if (hasText(candidate.getPhone())) {
            completedFields++;
        }

        if (hasText(candidate.getLocation())) {
            completedFields++;
        }

        if (hasText(candidate.getEducation())) {
            completedFields++;
        }

        if (hasText(candidate.getExperience())) {
            completedFields++;
        }

        if (hasText(candidate.getSkills())) {
            completedFields++;
        }

        if (hasText(candidate.getResume())) {
            completedFields++;
        }

        if (hasText(candidate.getLinkedin())) {
            completedFields++;
        }

        if (hasText(candidate.getPortfolio())) {
            completedFields++;
        }

        if (candidate.getExpectedSalary() != null) {
            completedFields++;
        }

        if (hasText(candidate.getNoticePeriod())) {
            completedFields++;
        }

        return (completedFields * 100) / totalFields;
    }

    /*
     * Check whether a String has usable content.
     */
    private boolean hasText(String value) {

        return value != null
                && !value.trim().isEmpty();
    }

    /*
     * =============================================================
     * RECOMMENDED JOBS
     * =============================================================
     */
    private List<CandidateDashboardJobDto> getRecommendedJobs(
            Long candidateId
    ) {

        /*
         * Find jobs for which the candidate has already applied.
         */
        List<Application> applications =
                applicationRepository.findByCandidateId(
                        candidateId
                );

        Set<Long> appliedJobIds =
                applications.stream()
                        .map(Application::getJobId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        /*
         * Get currently OPEN jobs.
         *
         * We exclude jobs that this candidate has already applied for.
         */
        return jobRepository.findAll()
                .stream()
                .filter(job ->
                        job.getStatus() != null
                                && job.getStatus()
                                .equalsIgnoreCase("OPEN")
                )
                .filter(job ->
                        !appliedJobIds.contains(job.getId())
                )
                .sorted(
                        Comparator.comparing(
                                Job::getCreatedDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .limit(5)
                .map(this::toJobDto)
                .toList();
    }

    /*
     * Convert Job entity to Candidate Dashboard Job DTO.
     */
    private CandidateDashboardJobDto toJobDto(
            Job job
    ) {

        return CandidateDashboardJobDto.builder()
                .jobId(
                        job.getId()
                )
                .title(
                        job.getTitle()
                )
                .department(
                        job.getDepartment()
                )
                .location(
                        job.getLocation()
                )
                .employmentType(
                        job.getEmploymentType()
                )
                .experienceMin(
                        job.getExperienceMin()
                )
                .experienceMax(
                        job.getExperienceMax()
                )
                .salaryMin(
                        job.getSalaryMin()
                )
                .salaryMax(
                        job.getSalaryMax()
                )
                .requiredSkills(
                        job.getRequiredSkills()
                )
                .preferredSkills(
                        job.getPreferredSkills()
                )
                .education(
                        job.getEducation()
                )
                .description(
                        job.getDescription()
                )
                .responsibilities(
                        job.getResponsibilities()
                )
                .openings(
                        job.getOpenings()
                )
                .status(
                        job.getStatus()
                )
                .build();
    }
}