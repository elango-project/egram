package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
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
    private String category;
    private String difficulty;
    private Integer durationMinutes;
    private String createdBy;
    private int totalModules;
    private int completedModules;
    
    // For admins
    private long enrollmentCount;
    private double completionRate;
    
    // For students
    private boolean enrolled;
    private int progressPercentage;
    
    private List<CourseModuleResponse> modules;
    
    private LocalDateTime createdAt;
}
