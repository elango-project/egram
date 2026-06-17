package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssessmentAnalyticsResponse {
    private long totalAttempts;
    private double averageScore;
    private double passRate;
    private int highestScore;
}
