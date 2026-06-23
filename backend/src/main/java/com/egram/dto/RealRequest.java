package com.egram.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RealRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String videoUrl;

    private String thumbnailUrl;

    private String youtubeUrl;

    private String category;

    private java.util.List<String> tags;
}
