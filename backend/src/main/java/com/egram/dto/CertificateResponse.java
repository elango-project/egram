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
public class CertificateResponse {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private String studentName;
    private String certificateNumber;
    private String verificationCode;
    private LocalDateTime issuedAt;
}
