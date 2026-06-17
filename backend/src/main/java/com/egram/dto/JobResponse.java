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
public class JobResponse {
    private UUID id;
    private String title;
    private String companyName;
    private String description;
    private String location;
    private String type;
    private String applyUrl;
    private Boolean active;
    private LocalDateTime createdAt;
    
    // For students
    private boolean saved;
    private boolean applied;
}
