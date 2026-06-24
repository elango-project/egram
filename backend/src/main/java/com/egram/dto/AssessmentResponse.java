package com.egram.dto;

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
public class AssessmentResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer passingPercentage;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Boolean active;
    private String courseTitle;
    private UUID courseId;
    private java.util.List<AssessmentQuestionResponse> questions;
    private LocalDateTime createdAt;
}
