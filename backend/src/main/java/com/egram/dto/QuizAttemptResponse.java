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
public class QuizAttemptResponse {
    private UUID id;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer score;
    private Boolean passed;
    private LocalDateTime submittedAt;
}
