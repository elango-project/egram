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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobOpportunityRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

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
                .type(OpportunityType.valueOf(request.getType().toUpperCase()))
                .employmentType(request.getEmploymentType())
                .duration(request.getDuration())
                .stipend(request.getStipend())
                .salaryPackage(request.getSalaryPackage())
                .skillsRequired(request.getSkillsRequired())
                .experienceRequired(request.getExperienceRequired())
                .companyLogoUrl(request.getCompanyLogoUrl())
                .remoteType(request.getRemoteType())
                .deadline(request.getDeadline())
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
        job.setType(OpportunityType.valueOf(request.getType().toUpperCase()));
        job.setEmploymentType(request.getEmploymentType());
        job.setDuration(request.getDuration());
        job.setStipend(request.getStipend());
        job.setSalaryPackage(request.getSalaryPackage());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setCompanyLogoUrl(request.getCompanyLogoUrl());
        job.setRemoteType(request.getRemoteType());
        job.setDeadline(request.getDeadline());
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
        
        savedJobRepository.deleteByJobId(id);
        applicationRepository.deleteByJobId(id);
        jobRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getJobApplications(UUID jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new EgramException("Job not found", HttpStatus.NOT_FOUND);
        }
        return applicationRepository.findByJobId(jobId).stream()
                .map(app -> JobApplicationResponse.builder()
                        .jobId(app.getJob().getId())
                        .studentId(app.getStudent().getId())
                        .studentName(app.getStudent().getFullName())
                        .studentEmail(app.getStudent().getEmail())
                        .resumeUrl(app.getResumeUrl())
                        .coverLetter(app.getCoverLetter())
                        .status(app.getStatus())
                        .appliedAt(app.getAppliedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateApplicationStatus(UUID jobId, UUID studentId, String status) {
        JobApplicationId id = new JobApplicationId(jobId, studentId);
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new EgramException("Application not found", HttpStatus.NOT_FOUND));
        try {
            app.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new EgramException("Invalid status", HttpStatus.BAD_REQUEST);
        }
        applicationRepository.save(app);
    }

    // --- Authenticated / Shared ---

    @Transactional(readOnly = true)
    public List<JobResponse> getJobs(String type, String location, String remoteType, Boolean activeOnly) {
        User currentUser = getCurrentUser();
        List<JobOpportunity> jobs;

        if (Boolean.FALSE.equals(activeOnly) && "ADMIN".equals(currentUser.getRole().name())) {
            jobs = jobRepository.findAllByOrderByCreatedAtDesc();
        } else {
            jobs = jobRepository.findByActiveTrueOrderByCreatedAtDesc();
            // Filter out expired jobs automatically
            LocalDate today = LocalDate.now();
            jobs = jobs.stream()
                .filter(job -> job.getDeadline() == null || !job.getDeadline().isBefore(today))
                .collect(Collectors.toList());
        }

        if (type != null && !type.isBlank()) {
            jobs = jobs.stream().filter(j -> j.getType().name().equalsIgnoreCase(type)).collect(Collectors.toList());
        }
        if (location != null && !location.isBlank()) {
            jobs = jobs.stream().filter(j -> j.getLocation() != null && j.getLocation().toLowerCase().contains(location.toLowerCase())).collect(Collectors.toList());
        }
        if (remoteType != null && !remoteType.isBlank()) {
            jobs = jobs.stream().filter(j -> j.getRemoteType() != null && j.getRemoteType().equalsIgnoreCase(remoteType)).collect(Collectors.toList());
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
    public void applyJob(UUID jobId, JobApplicationRequest request) {
        User student = getCurrentUser();
        JobOpportunity job = getJobOrThrow(jobId);

        if (!job.getActive() || (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now()))) {
            throw new EgramException("Job is no longer active", HttpStatus.BAD_REQUEST);
        }

        if (applicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new EgramException("Already applied for this job", HttpStatus.BAD_REQUEST);
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .student(student)
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        applicationRepository.save(application);

        // Update user's resumeUrl if it was empty
        if (student.getResumeUrl() == null || student.getResumeUrl().isBlank()) {
            student.setResumeUrl(request.getResumeUrl());
            userRepository.save(student);
        }
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs() {
        User student = getCurrentUser();
        return savedJobRepository.findByStudentId(student.getId()).stream()
                .map(savedJob -> mapToResponse(savedJob.getJob(), student))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getMyApplications() {
        User student = getCurrentUser();
        return applicationRepository.findByStudentId(student.getId()).stream()
                .map(app -> JobApplicationResponse.builder()
                        .jobId(app.getJob().getId())
                        .studentId(app.getStudent().getId())
                        .resumeUrl(app.getResumeUrl())
                        .coverLetter(app.getCoverLetter())
                        .status(app.getStatus())
                        .appliedAt(app.getAppliedAt())
                        .job(mapToResponse(app.getJob(), student))
                        .build())
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private JobResponse mapToResponse(JobOpportunity job, User currentUser) {
        boolean isSaved = false;
        boolean isApplied = false;
        ApplicationStatus appStatus = null;
        int appCount = applicationRepository.countByJobId(job.getId());

        if ("STUDENT".equals(currentUser.getRole().name())) {
            isSaved = savedJobRepository.existsByJobIdAndStudentId(job.getId(), currentUser.getId());
            JobApplicationId appId = new JobApplicationId(job.getId(), currentUser.getId());
            var appOpt = applicationRepository.findById(appId);
            if (appOpt.isPresent()) {
                isApplied = true;
                appStatus = appOpt.get().getStatus();
            }
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .companyName(job.getCompanyName())
                .description(job.getDescription())
                .location(job.getLocation())
                .type(job.getType().name())
                .employmentType(job.getEmploymentType())
                .duration(job.getDuration())
                .stipend(job.getStipend())
                .salaryPackage(job.getSalaryPackage())
                .skillsRequired(job.getSkillsRequired())
                .experienceRequired(job.getExperienceRequired())
                .companyLogoUrl(job.getCompanyLogoUrl())
                .remoteType(job.getRemoteType())
                .deadline(job.getDeadline())
                .applyUrl(job.getApplyUrl())
                .active(job.getActive())
                .createdAt(job.getCreatedAt())
                .applicationCount(appCount)
                .saved(isSaved)
                .applied(isApplied)
                .applicationStatus(appStatus)
                .build();
    }
}
