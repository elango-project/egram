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
public class CourseProgressResponse {
    private UUID id;
    private UUID courseId;
    private Boolean completed;
    private LocalDateTime completedAt;
    
    // dynamically calculated fields
    private Integer completedTopics;
    private Integer totalTopics;
    private Double progressPercentage;
}
