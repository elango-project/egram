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
public class RealResponse {
    private UUID id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String uploaderName;
    private UUID uploaderId;
    private LocalDateTime createdAt;
    
    private boolean isLikedByCurrentUser;
    private boolean isSavedByCurrentUser;
    private long likeCount;
}
