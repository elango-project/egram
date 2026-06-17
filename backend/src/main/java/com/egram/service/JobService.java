package com.egram.service;

import com.egram.dto.*;
import com.egram.entity.*;
import com.egram.exception.EgramException;
import com.egram.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobOpportunityRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository applicationRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private JobOpportunity getJobOrThrow(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new EgramException("Job/Internship not found", HttpStatus.NOT_FOUND));
    }

    // --- Admin Endpoints ---

    @Transactional
    public JobResponse createJob(JobRequest request) {
        User admin = getCurrentUser();

        JobOpportunity job = JobOpportunity.builder()
                .title(request.getTitle())
                .companyName(request.getCompanyName())
                .description(request.getDescription())
                .location(request.getLocation())
                .type(request.getType())
                .applyUrl(request.getApplyUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .createdBy(admin)
                .build();

        job = jobRepository.save(job);
        return mapToResponse(job, admin);
    }

    @Transactional
    public JobResponse updateJob(UUID id, JobRequest request) {
        JobOpportunity job = getJobOrThrow(id);

        job.setTitle(request.getTitle());
        job.setCompanyName(request.getCompanyName());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setApplyUrl(request.getApplyUrl());
        if (request.getActive() != null) {
            job.setActive(request.getActive());
        }

        job = jobRepository.save(job);
        return mapToResponse(job, getCurrentUser());
    }

    @Transactional
    public void deleteJob(UUID id) {
        if (!jobRepository.existsById(id)) {
            throw new EgramException("Job/Internship not found", HttpStatus.NOT_FOUND);
        }
        
        // Cascade deletes
        savedJobRepository.deleteByJobId(id);
        applicationRepository.deleteByJobId(id);
        jobRepository.deleteById(id);
    }

    // --- Authenticated / Shared ---

    @Transactional(readOnly = true)
    public List<JobResponse> getJobs(String type) {
        User currentUser = getCurrentUser();
        List<JobOpportunity> jobs;
        
        if (type != null && !type.isBlank()) {
            jobs = jobRepository.findByTypeAndActiveTrueOrderByCreatedAtDesc(type);
        } else {
            jobs = jobRepository.findByActiveTrueOrderByCreatedAtDesc();
        }

        return jobs.stream()
                .map(job -> mapToResponse(job, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(UUID id) {
        return mapToResponse(getJobOrThrow(id), getCurrentUser());
    }

    // --- Student ---

    @Transactional
    public void saveJob(UUID jobId) {
        User student = getCurrentUser();
        JobOpportunity job = getJobOrThrow(jobId);

        if (savedJobRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new EgramException("Job already saved", HttpStatus.BAD_REQUEST);
        }

        SavedJob savedJob = SavedJob.builder()
                .job(job)
                .student(student)
                .build();

        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(UUID jobId) {
        User student = getCurrentUser();
        if (!savedJobRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new EgramException("Job is not saved", HttpStatus.NOT_FOUND);
        }
        savedJobRepository.deleteByJobIdAndStudentId(jobId, student.getId());
    }

    @Transactional
    public void applyJob(UUID jobId) {
        User student = getCurrentUser();
        JobOpportunity job = getJobOrThrow(jobId);

        if (!job.getActive()) {
            throw new EgramException("Job is no longer active", HttpStatus.BAD_REQUEST);
        }

        if (applicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new EgramException("Already applied for this job", HttpStatus.BAD_REQUEST);
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .student(student)
                .build();

        applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs() {
        User student = getCurrentUser();
        return savedJobRepository.findByStudentId(student.getId()).stream()
                .map(savedJob -> mapToResponse(savedJob.getJob(), student))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAppliedJobs() {
        User student = getCurrentUser();
        return applicationRepository.findByStudentId(student.getId()).stream()
                .map(application -> mapToResponse(application.getJob(), student))
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private JobResponse mapToResponse(JobOpportunity job, User currentUser) {
        boolean isSaved = false;
        boolean isApplied = false;

        if ("STUDENT".equals(currentUser.getRole().name())) {
            isSaved = savedJobRepository.existsByJobIdAndStudentId(job.getId(), currentUser.getId());
            isApplied = applicationRepository.existsByJobIdAndStudentId(job.getId(), currentUser.getId());
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .companyName(job.getCompanyName())
                .description(job.getDescription())
                .location(job.getLocation())
                .type(job.getType())
                .applyUrl(job.getApplyUrl())
                .active(job.getActive())
                .createdAt(job.getCreatedAt())
                .saved(isSaved)
                .applied(isApplied)
                .build();
    }
}
