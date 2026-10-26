
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerCandidateDetailsDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
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
    private final ResumeRepository resumeRepository;

    public InterviewerCandidateDetailsService(
            CandidateRepository candidateRepository,
            InterviewRepository interviewRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ResumeRepository resumeRepository) {

        this.candidateRepository = candidateRepository;
        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    public ResponseEntity<ApiResponse<InterviewerCandidateDetailsDto>>
    getCandidateDetails(
            Authentication authentication,
            Long candidateId) {

        User user = getLoggedInUser(authentication);
        Long interviewerId = user.getUserId();

        Candidate candidate = candidateRepository.findById(candidateId)
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

        // Find interviews assigned to the logged-in interviewer.
        List<Interview> interviews =
                interviewRepository.findByInterviewerId(interviewerId);

        Interview candidateInterview = null;

        // Select the latest interview for this candidate.
        for (Interview interview : interviews) {
            if (candidateId.equals(interview.getCandidateId())) {
                if (candidateInterview == null ||
                        (interview.getInterviewDateTime() != null &&
                                (candidateInterview.getInterviewDateTime() == null ||
                                        interview.getInterviewDateTime().isAfter(
                                                candidateInterview.getInterviewDateTime()
                                        )))) {
                    candidateInterview = interview;
                }
            }
        }

        // Do not allow an interviewer to access an unassigned candidate.
        if (candidateInterview == null) {
            return ResponseEntity.status(403).body(
                    new ApiResponse<>(
                            false,
                            "You are not assigned to this candidate",
                            null
                    )
            );
        }

        Job job = jobRepository.findById(candidateInterview.getJobId())
                .orElse(null);

        // Retrieve the latest resume record for this candidate.
        Resume resume = resumeRepository
                .findFirstByCandidateIdOrderByIdDesc(candidateId)
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

        // Return both the resume database ID and its filename.
        dto.setResumeId(resume != null ? resume.getId() : null);
        dto.setResume(resume != null ? resume.getFileName() : null);

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
        dto.setInterviewMode(candidateInterview.getInterviewMode());

        if (candidateInterview.getStatus() != null) {
            dto.setInterviewStatus(
                    candidateInterview.getStatus().name()
            );
        }

        dto.setAiMatchScore(null);
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
        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));
    }
}
