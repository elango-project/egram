package com.egram.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssessmentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Passing percentage is required")
    @Min(value = 0, message = "Passing percentage cannot be less than 0")
    @Max(value = 100, message = "Passing percentage cannot be more than 100")
    private Integer passingPercentage;

    @NotNull(message = "Max attempts is required")
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;

    private Boolean active;

    private java.util.List<AssessmentQuestionRequest> questions;
}
