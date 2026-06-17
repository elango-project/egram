package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VideoProgressResponse {
    private Long currentPositionSeconds;
    private Double percentageWatched;
    private LocalDateTime lastWatchedAt;
    private Boolean completed;
}
