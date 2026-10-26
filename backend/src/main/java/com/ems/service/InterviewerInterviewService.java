
        package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.InterviewStatus;
import com.ems.dto.InterviewerInterviewDto;
import com.ems.dto.MyInterviewsResponseDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewerInterviewService {

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public InterviewerInterviewService(
            InterviewRepository interviewRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // Get all interviews assigned to the logged-in interviewer.
    public ResponseEntity<ApiResponse<MyInterviewsResponseDto>> getMyInterviews(
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        List<InterviewerInterviewDto> interviewDtos =
                convertToDtos(interviews);

        // Include both scheduled and rescheduled interviews.
        long scheduledCount = interviews.stream()
                .filter(interview ->
                        interview.getStatus() == InterviewStatus.SCHEDULED
                                || interview.getStatus()
                                == InterviewStatus.RESCHEDULED)
                .count();

        long completedCount = interviews.stream()
                .filter(interview ->
                        interview.getStatus() == InterviewStatus.COMPLETED)
                .count();

        MyInterviewsResponseDto response =
                new MyInterviewsResponseDto(
                        scheduledCount,
                        completedCount,
                        (long) interviews.size(),
                        interviewDtos
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "My interviews retrieved successfully",
                        response
                )
        );
    }

    // Search and filter the logged-in interviewer's interviews.
    public ResponseEntity<ApiResponse<List<InterviewerInterviewDto>>> searchMyInterviews(
            Authentication authentication,
            String keyword,
            String status,
            LocalDate date) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        List<InterviewerInterviewDto> result = new ArrayList<>();

        String searchKeyword =
                keyword == null ? "" : keyword.trim().toLowerCase();

        for (Interview interview : interviews) {

            // Filter by status when supplied.
            if (status != null && !status.isBlank()) {

                if (interview.getStatus() == null
                        || !interview.getStatus()
                        .name()
                        .equalsIgnoreCase(status.trim())) {
                    continue;
                }
            }

            // Filter by interview date when supplied.
            if (date != null) {

                if (interview.getInterviewDateTime() == null
                        || !interview.getInterviewDateTime()
                        .toLocalDate()
                        .equals(date)) {
                    continue;
                }
            }

            Candidate candidate =
                    candidateRepository.findById(interview.getCandidateId())
                            .orElse(null);

            Job job =
                    jobRepository.findById(interview.getJobId())
                            .orElse(null);

            String candidateName =
                    candidate != null && candidate.getName() != null
                            ? candidate.getName().toLowerCase()
                            : "";

            String candidateEmail =
                    candidate != null && candidate.getEmail() != null
                            ? candidate.getEmail().toLowerCase()
                            : "";

            String jobTitle =
                    job != null && job.getTitle() != null
                            ? job.getTitle().toLowerCase()
                            : "";

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
                        "Interviews retrieved successfully",
                        result
                )
        );
    }

    // Get details for one interview assigned to this interviewer.
    public ResponseEntity<ApiResponse<InterviewerInterviewDto>> getInterviewDetails(
            Authentication authentication,
            Long interviewId) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        Interview interview =
                interviewRepository.findById(interviewId).orElse(null);

        if (interview == null) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(
                            false,
                            "Interview not found",
                            null
                    )
            );
        }

        if (!interviewerId.equals(interview.getInterviewerId())) {
            return ResponseEntity.status(403).body(
                    new ApiResponse<>(
                            false,
                            "You are not assigned to this interview",
                            null
                    )
            );
        }

        Candidate candidate =
                candidateRepository.findById(interview.getCandidateId())
                        .orElse(null);

        Job job =
                jobRepository.findById(interview.getJobId())
                        .orElse(null);

        InterviewerInterviewDto dto =
                toDto(interview, candidate, job);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Interview details retrieved successfully",
                        dto
                )
        );
    }

    // Resolve the currently authenticated user.
    private User getLoggedInUser(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Authentication is required");
        }

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));
    }

    // Convert interview entities to response DTOs.
    private List<InterviewerInterviewDto> convertToDtos(
            List<Interview> interviews) {

        List<InterviewerInterviewDto> result = new ArrayList<>();

        for (Interview interview : interviews) {

            Candidate candidate =
                    candidateRepository.findById(interview.getCandidateId())
                            .orElse(null);

            Job job =
                    jobRepository.findById(interview.getJobId())
                            .orElse(null);

            result.add(toDto(interview, candidate, job));
        }

        return result;
    }

    // Map interview, candidate, and job data into the existing DTO.
    private InterviewerInterviewDto toDto(
            Interview interview,
            Candidate candidate,
            Job job) {

        return new InterviewerInterviewDto(
                interview.getInterviewId(),

                interview.getCandidateId(),
                candidate != null ? candidate.getName() : null,
                candidate != null ? candidate.getEmail() : null,

                interview.getJobId(),
                job != null ? job.getTitle() : null,

                interview.getInterviewDateTime(),

                interview.getInterviewMode(),
                interview.getMeetingLink(),
                interview.getLocation(),

                interview.getStatus() != null
                        ? interview.getStatus().name()
                        : null,

                interview.getNotes()
        );
    }
}
