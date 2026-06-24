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
public class CertificateEligibilityResponse {
    private UUID courseId;
    private UUID studentId;
    private Boolean eligible;
    private Long completedTopics;
    private Long totalTopics;
    private Integer progressPercentage;
}
