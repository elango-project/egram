package com.egram.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationRequest {
    @NotBlank(message = "Resume URL is required")
    @URL(message = "Resume URL must be a valid URL")
    private String resumeUrl;
    
    private String coverLetter;
}
