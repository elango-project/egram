package com.egram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizSubmitRequest {
    // Map of questionId to selected answer string (e.g. "A", "B")
    private Map<UUID, String> answers;
}
