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
public class AssessmentAttemptResponse {
    private UUID id;
    private UUID assessmentId;
    private String studentName;
    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int percentage;
    private boolean passed;
    private int attemptNumber;
    private String questionOrder;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
