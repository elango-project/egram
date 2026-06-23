package com.egram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicQuizRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Passing percentage is required")
    private Integer passingPercentage;

    @NotNull(message = "Max attempts is required")
    private Integer maxAttempts;

    private List<TopicQuestionRequest> questions;
}
