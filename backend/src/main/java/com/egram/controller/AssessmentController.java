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
@RequestMapping("/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AssessmentResponse> createAssessment(@Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assessmentService.createAssessment(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AssessmentResponse> updateAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.updateAssessment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAssessment(@PathVariable UUID id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AssessmentQuestionResponse> addQuestion(
            @PathVariable UUID id,
            @Valid @RequestBody AssessmentQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assessmentService.addQuestion(id, request));
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeQuestion(@PathVariable UUID questionId) {
        assessmentService.removeQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    // --- Authenticated / Shared Endpoints ---

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AssessmentResponse>> getAssessments() {
        return ResponseEntity.ok(assessmentService.getAssessments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AssessmentResponse> getAssessment(@PathVariable UUID id) {
        return ResponseEntity.ok(assessmentService.getAssessment(id));
    }

    // --- Student Endpoints ---

    @GetMapping("/{id}/questions")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<AssessmentQuestionResponse>> getQuestionsForStudent(@PathVariable UUID id) {
        return ResponseEntity.ok(assessmentService.getQuestionsForStudent(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody AssessmentSubmissionRequest request) {
        return ResponseEntity.ok(assessmentService.submitAssessment(id, request));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<AssessmentAttemptResponse>> getAttemptHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(assessmentService.getAttemptHistory(id));
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AssessmentAnalyticsResponse> getAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(assessmentService.getAnalytics(id));
    }
}
