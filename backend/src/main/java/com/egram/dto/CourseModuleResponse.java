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
public class CourseModuleResponse {
    private UUID id;
    private String title;
    private Integer moduleOrder;
    private java.util.List<TopicResponse> topics;
}
