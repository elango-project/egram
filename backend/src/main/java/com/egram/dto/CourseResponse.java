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
public class CourseResponse {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String createdBy;
    private int totalModules;
    
    // For students
    private boolean enrolled;
    private int progressPercentage;
    
    private LocalDateTime createdAt;
}
