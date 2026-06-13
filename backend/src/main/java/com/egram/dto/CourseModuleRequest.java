package com.egram.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CourseModuleRequest {

    @NotBlank(message = "Module title is required")
    private String title;

    @NotNull(message = "Module order is required")
    private Integer moduleOrder;

    private UUID realId;
    private UUID longFormVideoId;
}
