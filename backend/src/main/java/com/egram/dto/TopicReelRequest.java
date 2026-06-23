package com.egram.dto;

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
public class TopicReelRequest {

    @NotNull(message = "Reel ID is required")
    private UUID reelId;

    @NotNull(message = "Reel order is required")
    private Integer reelOrder;
}
