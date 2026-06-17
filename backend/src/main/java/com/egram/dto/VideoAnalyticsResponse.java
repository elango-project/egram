package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VideoAnalyticsResponse {
    private UUID videoId;
    private Long views;
    private Long likes;
    private Long comments;
    private Double averageWatchPercentage;
    private Double completionRate;
    private Long continueWatchingCount;
}
