package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_jobs_type_active", columnList = "type, active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location")
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private OpportunityType type; // JOB or INTERNSHIP

    @Column(name = "employment_type")
    private String employmentType; // e.g., FULL_TIME, PART_TIME

    @Column(name = "duration")
    private String duration; // e.g., 6 months

    @Column(name = "stipend")
    private String stipend;

    @Column(name = "salary_package")
    private String salaryPackage;

    @Column(name = "skills_required")
    private String skillsRequired;

    @Column(name = "experience_required")
    private String experienceRequired;

    @Column(name = "company_logo_url")
    private String companyLogoUrl;

    @Column(name = "remote_type")
    private String remoteType; // REMOTE, HYBRID, ONSITE

    @Column(name = "deadline")
    private java.time.LocalDate deadline;

    @Column(name = "apply_url")
    private String applyUrl;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
