package com.egram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Integer estimatedDurationMinutes;

    @NotNull(message = "Topic order is required")
    private Integer topicOrder;
}
