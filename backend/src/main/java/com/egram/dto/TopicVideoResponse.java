package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicVideoResponse {
    private UUID id;
    private UUID videoId;
    private Integer videoOrder;
    private String title;
    private String thumbnailUrl;
}
