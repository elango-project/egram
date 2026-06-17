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
public class JobRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String description;
    
    private String location;

    @NotBlank(message = "Type is required")
    private String type; // JOB or INTERNSHIP

    @URL(message = "Apply URL must be a valid URL")
    private String applyUrl;
    
    @Builder.Default
    private Boolean active = true;
}
