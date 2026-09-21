package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.JobAssignedDto;
import com.ems.entity.Job;
import com.ems.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;


    // =========================
    // CREATE JOB
    // =========================

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Job>> createJob(
            @RequestBody Job job
    ) {

        return jobService.createJob(job);
    }


    // =========================
    // GET ALL JOBS
    // =========================

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs() {

        return jobService.getAllJobs();
    }


    // =========================
    // GET ASSIGNED JOBS
    // =========================

    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<JobAssignedDto>>>
    getAssignedJobs(Authentication authentication) {

        return jobService.getAssignedJobs(authentication);
    }


    // =========================
    // SEARCH JOBS
    // =========================

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Job>>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location
    ) {

        return jobService.searchJobs(
                title,
                location
        );
    }


    // =========================
    // GET JOB BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> getJobById(
            @PathVariable Long id
    ) {

        return jobService.getJobById(id);
    }


    // =========================
    // UPDATE JOB
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> updateJob(
            @PathVariable Long id,
            @RequestBody Job job
    ) {

        Job updatedJob =
                jobService.updateJob(id, job);

        if (updatedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job updated successfully",
                        updatedJob
                )
        );
    }


    // =========================
    // ACTIVATE / START JOB
    // =========================

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Job>> activateJob(
            @PathVariable Long id
    ) {

        Job activatedJob =
                jobService.activateJob(id);

        if (activatedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job activated successfully",
                        activatedJob
                )
        );
    }


    // =========================
    // CLOSE JOB
    // =========================

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Job>> closeJob(
            @PathVariable Long id
    ) {

        Job closedJob =
                jobService.closeJob(id);

        if (closedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Job closed successfully",
                        closedJob
                )
        );
    }


    // =========================
    // DELETE JOB
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteJob(
            @PathVariable Long id
    ) {

        return jobService.deleteJob(id);
    }
}