package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.InterviewStatus;
import com.ems.dto.InterviewerCandidateDto;
import com.ems.dto.InterviewerCandidatesResponseDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewerCandidateRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewerCandidateService {

    private final InterviewerCandidateRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public InterviewerCandidateService(
            InterviewerCandidateRepository interviewRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<InterviewerCandidatesResponseDto>>
    getMyCandidates(Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        List<InterviewerCandidateDto> candidates =
                convertToDtos(interviews);

        long scheduledCount = interviews.stream()
                .filter(interview ->
                        interview.getStatus() != null &&
                                interview.getStatus() == InterviewStatus.SCHEDULED)
                .count();

        long completedCount = interviews.stream()
                .filter(interview ->
                        interview.getStatus() != null &&
                                interview.getStatus() == InterviewStatus.COMPLETED)
                .count();

        InterviewerCandidatesResponseDto response =
                new InterviewerCandidatesResponseDto(
                        (long) candidates.size(),
                        scheduledCount,
                        completedCount,
                        candidates
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "My candidates retrieved successfully",
                        response
                )
        );
    }

    public ResponseEntity<ApiResponse<List<InterviewerCandidateDto>>>
    searchCandidates(
            Authentication authentication,
            String keyword,
            Long jobId,
            String status,
            LocalDate date) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        List<InterviewerCandidateDto> result = new ArrayList<>();

        String searchKeyword =
                keyword == null
                        ? ""
                        : keyword.trim().toLowerCase();

        for (Interview interview : interviews) {

            if (jobId != null &&
                    !jobId.equals(interview.getJobId())) {
                continue;
            }

            if (status != null && !status.isBlank()) {

                if (interview.getStatus() == null ||
                        !interview.getStatus()
                                .name()
                                .equalsIgnoreCase(status)) {

                    continue;
                }
            }

            if (date != null) {

                if (interview.getInterviewDateTime() == null ||
                        !interview.getInterviewDateTime()
                                .toLocalDate()
                                .equals(date)) {

                    continue;
                }
            }

            Candidate candidate =
                    candidateRepository
                            .findById(interview.getCandidateId())
                            .orElse(null);

            Job job =
                    jobRepository
                            .findById(interview.getJobId())
                            .orElse(null);

            if (candidate == null) {
                continue;
            }

            String candidateName =
                    candidate.getName() == null
                            ? ""
                            : candidate.getName().toLowerCase();

            String candidateEmail =
                    candidate.getEmail() == null
                            ? ""
                            : candidate.getEmail().toLowerCase();

            String jobTitle =
                    job == null || job.getTitle() == null
                            ? ""
                            : job.getTitle().toLowerCase();

            boolean matchesSearch =
                    searchKeyword.isBlank()
                            || candidateName.contains(searchKeyword)
                            || candidateEmail.contains(searchKeyword)
                            || jobTitle.contains(searchKeyword);

            if (!matchesSearch) {
                continue;
            }

            result.add(toDto(interview, candidate, job));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Candidates retrieved successfully",
                        result
                )
        );
    }

    public ResponseEntity<ApiResponse<InterviewerCandidateDto>>
    getCandidateDetails(
            Authentication authentication,
            Long candidateId) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        for (Interview interview : interviews) {

            if (!candidateId.equals(interview.getCandidateId())) {
                continue;
            }

            Candidate candidate =
                    candidateRepository
                            .findById(candidateId)
                            .orElse(null);

            if (candidate == null) {

                return ResponseEntity.status(404).body(
                        new ApiResponse<>(
                                false,
                                "Candidate not found",
                                null
                        )
                );
            }

            Job job =
                    jobRepository
                            .findById(interview.getJobId())
                            .orElse(null);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate details retrieved successfully",
                            toDto(interview, candidate, job)
                    )
            );
        }

        return ResponseEntity.status(403).body(
                new ApiResponse<>(
                        false,
                        "You are not assigned to this candidate",
                        null
                )
        );
    }

    private User getLoggedInUser(Authentication authentication) {

        String email = authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));
    }

    private List<InterviewerCandidateDto> convertToDtos(
            List<Interview> interviews) {

        List<InterviewerCandidateDto> result =
                new ArrayList<>();

        for (Interview interview : interviews) {

            Candidate candidate =
                    candidateRepository
                            .findById(interview.getCandidateId())
                            .orElse(null);

            Job job =
                    jobRepository
                            .findById(interview.getJobId())
                            .orElse(null);

            if (candidate != null) {
                result.add(
                        toDto(
                                interview,
                                candidate,
                                job
                        )
                );
            }
        }

        return result;
    }

    private InterviewerCandidateDto toDto(
            Interview interview,
            Candidate candidate,
            Job job) {

        return new InterviewerCandidateDto(

                candidate.getId(),

                candidate.getName(),
                candidate.getEmail(),
                candidate.getPhone(),
                candidate.getLocation(),
                candidate.getEducation(),
                candidate.getExperience(),
                candidate.getSkills(),
                candidate.getResume(),
                candidate.getLinkedin(),
                candidate.getPortfolio(),
                candidate.getExpectedSalary(),
                candidate.getNoticePeriod(),
                candidate.getSource(),
                candidate.getApplicationDate(),
                candidate.getStatus(),

                interview.getJobId(),
                job != null ? job.getTitle() : null,

                interview.getInterviewId(),
                interview.getInterviewDateTime(),
                interview.getInterviewMode(),

                interview.getStatus() != null
                        ? interview.getStatus().name()
                        : null
        );
    }
}