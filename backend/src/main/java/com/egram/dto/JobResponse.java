package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import com.egram.entity.ApplicationStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobResponse {
    private UUID id;
    private String title;
    private String companyName;
    private String description;
    private String location;
    private String type;
    private String applyUrl;
    private Boolean active;
    private LocalDateTime createdAt;
    
    // Phase 11E fields
    private String compensation;
    private String skillsRequired;
    private String companyLogoUrl;
    private String remoteType;
    private java.time.LocalDate expiryDate;
    private Integer applicationCount;
    
    // For students
    private boolean saved;
    private boolean applied;
    private ApplicationStatus applicationStatus;
}
