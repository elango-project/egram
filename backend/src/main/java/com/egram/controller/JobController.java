package com.egram.controller;

import com.egram.dto.JobRequest;
import com.egram.dto.JobResponse;
import com.egram.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/applications")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<com.egram.dto.JobApplicationResponse>> getJobApplications(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJobApplications(id));
    }

    @PutMapping("/{jobId}/applications/{studentId}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> updateApplicationStatus(
            @PathVariable UUID jobId,
            @PathVariable UUID studentId,
            @RequestParam String status) {
        jobService.updateApplicationStatus(jobId, studentId, status);
        return ResponseEntity.ok().build();
    }

    // --- Authenticated / Shared Endpoints ---

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<JobResponse>> getJobs(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String remoteType,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly) {
        return ResponseEntity.ok(jobService.getJobs(type, location, remoteType, activeOnly));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobResponse> getJob(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    // --- Student Endpoints ---

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> saveJob(@PathVariable UUID id) {
        jobService.saveJob(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> unsaveJob(@PathVariable UUID id) {
        jobService.unsaveJob(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> applyJob(
            @PathVariable UUID id,
            @Valid @RequestBody com.egram.dto.JobApplicationRequest request) {
        jobService.applyJob(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<JobResponse>> getSavedJobs() {
        return ResponseEntity.ok(jobService.getSavedJobs());
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<com.egram.dto.JobApplicationResponse>> getMyApplications() {
        return ResponseEntity.ok(jobService.getMyApplications());
    }
}
