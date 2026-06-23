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
public class TopicReelResponse {
    private UUID id; // the topic_reel ID
    private UUID reelId;
    private String title;
    private String thumbnailUrl;
    private Integer reelOrder;
}
