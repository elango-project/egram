package com.egram.dto;

import com.egram.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationResponse {
    private UUID jobId;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    
    // For when returning the user's applications
    private JobResponse job;
}
