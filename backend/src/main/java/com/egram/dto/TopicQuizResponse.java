package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicQuizResponse {
    private UUID id;
    private String title;
    private Integer passingPercentage;
    private Integer maxAttempts;
    private List<TopicQuestionResponse> questions;
}
