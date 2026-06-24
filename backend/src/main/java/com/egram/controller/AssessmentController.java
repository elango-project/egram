package com.egram.controller;

import com.egram.dto.*;
import com.egram.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssessmentResponse> createAssessment(
            @PathVariable UUID courseId,
            @Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assessmentService.createAssessment(courseId, request));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssessmentResponse> updateAssessment(
            @PathVariable UUID courseId,
            @Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.updateAssessment(courseId, request));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAssessment(@PathVariable UUID courseId) {
        assessmentService.deleteAssessment(courseId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/attempts/reset/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetAttempts(
            @PathVariable UUID courseId,
            @PathVariable UUID studentId) {
        AssessmentResponse assessment = assessmentService.getAssessmentByCourseId(courseId);
        assessmentService.resetAttempts(assessment.getId(), studentId);
        return ResponseEntity.ok().build();
    }

    // --- Student/Common Endpoints ---

    @GetMapping
    public ResponseEntity<AssessmentResponse> getAssessment(@PathVariable UUID courseId) {
        return ResponseEntity.ok(assessmentService.getAssessmentByCourseId(courseId));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<AssessmentQuestionResponse>> getAssessmentQuestions(@PathVariable UUID courseId) {
        return ResponseEntity.ok(assessmentService.getQuestionsForStudent(courseId));
    }

    @PostMapping("/submit")
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @PathVariable UUID courseId,
            @Valid @RequestBody AssessmentSubmissionRequest request) {
        return ResponseEntity.ok(assessmentService.submitAssessment(courseId, request));
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<AssessmentAttemptResponse>> getMyAttempts(@PathVariable UUID courseId) {
        return ResponseEntity.ok(assessmentService.getMyAttempts(courseId));
    }
}
