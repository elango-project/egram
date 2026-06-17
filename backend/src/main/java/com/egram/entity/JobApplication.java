package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications", indexes = {
        @Index(name = "idx_job_applications_job", columnList = "job_id"),
        @Index(name = "idx_job_applications_student", columnList = "student_id")
})
@IdClass(JobApplicationId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobOpportunity job;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }
}
