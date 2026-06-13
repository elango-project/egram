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
public class VideoCommentResponse {
    private UUID id;
    private UUID videoId;
    private UUID studentId;
    private String studentName;
    private String comment;
    private LocalDateTime createdAt;
}
