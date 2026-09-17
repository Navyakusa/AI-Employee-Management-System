package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerCandidateDetailsDto;
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

import java.util.List;

@Service
public class InterviewerCandidateDetailsService {

    private final CandidateRepository candidateRepository;
    private final InterviewRepository interviewRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public InterviewerCandidateDetailsService(
            CandidateRepository candidateRepository,
            InterviewRepository interviewRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.candidateRepository = candidateRepository;
        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<InterviewerCandidateDetailsDto>>
    getCandidateDetails(
            Authentication authentication,
            Long candidateId) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        Candidate candidate =
                candidateRepository.findById(candidateId)
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

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        Interview candidateInterview = null;

        for (Interview interview : interviews) {

            if (candidateId.equals(interview.getCandidateId())) {

                candidateInterview = interview;

                /*
                 * If the interviewer has multiple interviews
                 * for the same candidate, use the latest one.
                 */
                if (candidateInterview.getInterviewDateTime() == null ||
                        (interview.getInterviewDateTime() != null &&
                                interview.getInterviewDateTime()
                                        .isAfter(
                                                candidateInterview
                                                        .getInterviewDateTime()
                                        ))) {

                    candidateInterview = interview;
                }
            }
        }

        if (candidateInterview == null) {

            return ResponseEntity.status(403).body(
                    new ApiResponse<>(
                            false,
                            "You are not assigned to this candidate",
                            null
                    )
            );
        }

        Job job =
                jobRepository.findById(candidateInterview.getJobId())
                        .orElse(null);

        InterviewerCandidateDetailsDto dto =
                new InterviewerCandidateDetailsDto();

        dto.setCandidateId(candidate.getId());

        dto.setName(candidate.getName());
        dto.setEmail(candidate.getEmail());
        dto.setPhone(candidate.getPhone());
        dto.setLocation(candidate.getLocation());
        dto.setEducation(candidate.getEducation());
        dto.setExperience(candidate.getExperience());
        dto.setSkills(candidate.getSkills());
        dto.setResume(candidate.getResume());
        dto.setLinkedin(candidate.getLinkedin());
        dto.setPortfolio(candidate.getPortfolio());

        dto.setExpectedSalary(candidate.getExpectedSalary());
        dto.setNoticePeriod(candidate.getNoticePeriod());
        dto.setSource(candidate.getSource());
        dto.setApplicationDate(candidate.getApplicationDate());

        dto.setJobId(candidateInterview.getJobId());

        if (job != null) {
            dto.setAppliedPosition(job.getTitle());
        }

        dto.setInterviewId(candidateInterview.getInterviewId());
        dto.setInterviewDateTime(
                candidateInterview.getInterviewDateTime()
        );
        dto.setInterviewMode(
                candidateInterview.getInterviewMode()
        );

        if (candidateInterview.getStatus() != null) {
            dto.setInterviewStatus(
                    candidateInterview.getStatus().name()
            );
        }

        /*
         * AI Match Score
         *
         * This field is intentionally nullable here.
         * The actual AI matching service can populate it
         * when the AI Match integration is connected.
         */
        dto.setAiMatchScore(null);

        /*
         * Candidate entity currently does not contain
         * a separate professionalSummary field.
         *
         * Therefore we do not invent a value.
         */
        dto.setProfessionalSummary(null);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Candidate details retrieved successfully",
                        dto
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
}