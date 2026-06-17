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
public class AssessmentQuestionResponse {
    private UUID id;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
}
