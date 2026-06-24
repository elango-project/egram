package com.egram.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicVideoProgressRequest {
    @NotNull(message = "Video ID is required")
    private UUID videoId;

    @NotNull(message = "Watch percentage is required")
    private Integer watchPercentage;
}
