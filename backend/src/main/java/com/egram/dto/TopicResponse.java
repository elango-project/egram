package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer estimatedDurationMinutes;
    private Integer topicOrder;

    private Boolean hasQuickLearningPath;
    private Boolean hasDeepLearningPath;
    private Boolean hasQuiz;
    private Boolean hasAssessment;

    private java.util.List<TopicReelResponse> reels;
    private java.util.List<TopicVideoResponse> videos;
}
