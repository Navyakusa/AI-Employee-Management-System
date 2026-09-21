package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.JobAssignedDto;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.mapper.JobAssignedMapper;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobAssignedMapper jobAssignedMapper;

    @Autowired
    private ApplicationRepository applicationRepository;


    // =========================
    // CREATE JOB
    // =========================

    public ResponseEntity<ApiResponse<Job>> createJob(Job job) {

        if (job.getStatus() == null || job.getStatus().isBlank()) {
            job.setStatus("OPEN");
        }

        if (job.getCreatedDate() == null) {
            job.setCreatedDate(LocalDateTime.now());
        }

        Job savedJob = jobRepository.save(job);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job created successfully",
                        savedJob
                )
        );
    }


    // =========================
    // GET ALL JOBS
    // =========================

    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Jobs retrieved successfully",
                        jobs
                )
        );
    }


    // =========================
    // GET JOB BY ID
    // =========================

    public ResponseEntity<ApiResponse<Job>> getJobById(Long id) {

        Job job = jobRepository.findById(id).orElse(null);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job retrieved successfully",
                        job
                )
        );
    }


    // =========================
    // UPDATE JOB
    // =========================

    public Job updateJob(Long id, Job updatedJob) {

        Job existingJob =
                jobRepository.findById(id).orElse(null);

        if (existingJob == null) {
            return null;
        }

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDepartment(updatedJob.getDepartment());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setEmploymentType(updatedJob.getEmploymentType());

        existingJob.setExperienceMin(
                updatedJob.getExperienceMin()
        );

        existingJob.setExperienceMax(
                updatedJob.getExperienceMax()
        );

        existingJob.setSalaryMin(
                updatedJob.getSalaryMin()
        );

        existingJob.setSalaryMax(
                updatedJob.getSalaryMax()
        );

        existingJob.setRequiredSkills(
                updatedJob.getRequiredSkills()
        );

        existingJob.setPreferredSkills(
                updatedJob.getPreferredSkills()
        );

        existingJob.setEducation(
                updatedJob.getEducation()
        );

        existingJob.setDescription(
                updatedJob.getDescription()
        );

        existingJob.setResponsibilities(
                updatedJob.getResponsibilities()
        );

        existingJob.setOpenings(
                updatedJob.getOpenings()
        );

        existingJob.setStatus(
                updatedJob.getStatus()
        );

        existingJob.setClosingDate(
                updatedJob.getClosingDate()
        );

        existingJob.setHiringManagerId(
                updatedJob.getHiringManagerId()
        );

        return jobRepository.save(existingJob);
    }


    // =========================
    // ACTIVATE / START JOB
    // =========================

    public Job activateJob(Long id) {

        Job existingJob =
                jobRepository.findById(id).orElse(null);

        if (existingJob == null) {
            return null;
        }

        existingJob.setStatus("OPEN");

        // Clear closing date when reopening the job
        existingJob.setClosingDate(null);

        return jobRepository.save(existingJob);
    }


    // =========================
    // CLOSE JOB
    // =========================

    public Job closeJob(Long id) {

        Job existingJob =
                jobRepository.findById(id).orElse(null);

        if (existingJob == null) {
            return null;
        }

        existingJob.setStatus("CLOSED");

        if (existingJob.getClosingDate() == null) {
            existingJob.setClosingDate(LocalDateTime.now());
        }

        return jobRepository.save(existingJob);
    }


    // =========================
    // DELETE JOB
    // =========================

    public ResponseEntity<ApiResponse<String>> deleteJob(Long id) {

        Job existingJob =
                jobRepository.findById(id).orElse(null);

        if (existingJob == null) {
            return ResponseEntity.notFound().build();
        }

        jobRepository.deleteById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job deleted successfully",
                        "Job deleted successfully"
                )
        );
    }


    // =========================
    // SEARCH JOBS
    // =========================

    public ResponseEntity<ApiResponse<List<Job>>> searchJobs(
            String title,
            String location
    ) {

        // Search by title AND location
        if (title != null && !title.isBlank()
                && location != null && !location.isBlank()) {

            return jobRepository
                    .findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(
                            title,
                            location
                    );
        }

        // Search only by title
        if (title != null && !title.isBlank()) {

            return jobRepository
                    .findByTitleContainingIgnoreCase(title);
        }

        // Search only by location
        if (location != null && !location.isBlank()) {

            return jobRepository
                    .findByLocationContainingIgnoreCase(location);
        }

        // No search filters
        List<Job> jobs = jobRepository.findAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Jobs retrieved successfully",
                        jobs
                )
        );
    }


    // =========================
    // GET ASSIGNED JOBS
    // =========================

    public ResponseEntity<ApiResponse<List<JobAssignedDto>>>
    getAssignedJobs(Authentication authentication) {

        try {

            String email = authentication.getName();

            User hiringManager =
                    userRepository
                            .findByEmailIgnoreCase(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Hiring Manager not found"
                                    )
                            );

            Long hiringManagerId =
                    hiringManager.getUserId();

            List<Job> assignedJobs =
                    jobRepository.findByHiringManagerId(
                            hiringManagerId
                    );

            List<JobAssignedDto> result =
                    new ArrayList<>();

            for (Job job : assignedJobs) {

                JobAssignedDto dto =
                        jobAssignedMapper.toDto(job);

                Long candidateCount =
                        applicationRepository.countByJobId(
                                job.getId()
                        );

                dto.setCandidateCount(candidateCount);

                result.add(dto);
            }

            ApiResponse<List<JobAssignedDto>> response =
                    new ApiResponse<>(
                            true,
                            "Assigned jobs fetched successfully",
                            result
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<JobAssignedDto>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}