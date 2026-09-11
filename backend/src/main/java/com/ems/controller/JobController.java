package com.ems.controller;

import com.ems.entity.Job;
import com.ems.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Create a new job
    @PostMapping("/create")
    public ResponseEntity<Job> createJob(@RequestBody Job job) {

        Job createdJob = jobService.createJob(job);

        return ResponseEntity.ok(createdJob);
    }

    // Get all jobs
    @GetMapping("/all")
    public ResponseEntity<?> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    // Search jobs
    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location) {

        return ResponseEntity.ok(
                jobService.searchJobs(title, location)
        );
    }

    // Get one job by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(
            @PathVariable Long id) {

        Job job = jobService.getJobById(id);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(job);
    }

    // Update an existing job
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody Job job) {

        Job updatedJob = jobService.updateJob(id, job);

        if (updatedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedJob);
    }

    // Close a job
    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeJob(
            @PathVariable Long id) {

        Job closedJob = jobService.closeJob(id);

        if (closedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(closedJob);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id) {

        Job existingJob = jobService.getJobById(id);

        if (existingJob == null) {
            return ResponseEntity.notFound().build();
        }

        jobService.deleteJob(id);

        return ResponseEntity.ok("Job deleted successfully");
    }
}