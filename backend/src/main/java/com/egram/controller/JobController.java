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

    // --- Authenticated / Shared Endpoints ---

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<JobResponse>> getJobs(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(jobService.getJobs(type));
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
    public ResponseEntity<Void> applyJob(@PathVariable UUID id) {
        jobService.applyJob(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<JobResponse>> getSavedJobs() {
        return ResponseEntity.ok(jobService.getSavedJobs());
    }

    @GetMapping("/applied")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<JobResponse>> getAppliedJobs() {
        return ResponseEntity.ok(jobService.getAppliedJobs());
    }
}
