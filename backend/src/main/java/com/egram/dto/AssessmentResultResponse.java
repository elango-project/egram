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
public class AssessmentResultResponse {
    private UUID assessmentId;
    private Integer score;
    private Integer totalQuestions;
    private Integer percentage;
    private Boolean passed;
    private LocalDateTime submittedAt;
}
