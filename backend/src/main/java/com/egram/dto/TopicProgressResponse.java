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
public class TopicProgressResponse {
    private UUID id;
    private UUID topicId;
    private Boolean reelsCompleted;
    private Boolean videoCompleted;
    private Boolean quizUnlocked;
    private Boolean quizCompleted;
    private Boolean topicCompleted;
    private LocalDateTime completedAt;
}
