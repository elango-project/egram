package com.egram.controller;

import com.egram.dto.*;
import com.egram.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID id,
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/modules")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CourseModuleResponse> addModule(
            @PathVariable UUID id,
            @Valid @RequestBody CourseModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.addModule(id, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeModule(@PathVariable UUID moduleId) {
        courseService.removeModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/modules/{moduleId}/topics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TopicResponse> addTopic(
            @PathVariable UUID moduleId,
            @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.addTopic(moduleId, request));
    }

    @DeleteMapping("/topics/{topicId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeTopic(@PathVariable UUID topicId) {
        courseService.removeTopic(topicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/topics/{topicId}/reels")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TopicReelResponse> addReelToTopic(
            @PathVariable UUID topicId,
            @Valid @RequestBody TopicReelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.addReelToTopic(topicId, request));
    }

    @DeleteMapping("/topics/{topicId}/reels/{reelId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeReelFromTopic(
            @PathVariable UUID topicId,
            @PathVariable UUID reelId) {
        courseService.removeReelFromTopic(topicId, reelId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/topics/{topicId}/reels/reorder")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> reorderTopicReels(
            @PathVariable UUID topicId,
            @Valid @RequestBody ReorderRequest request) {
        courseService.reorderTopicReels(topicId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/topics/{topicId}/videos")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TopicVideoResponse> addVideoToTopic(
            @PathVariable UUID topicId,
            @Valid @RequestBody TopicVideoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.addVideoToTopic(topicId, request));
    }

    @DeleteMapping("/topics/{topicId}/videos/{videoId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeVideoFromTopic(
            @PathVariable UUID topicId,
            @PathVariable UUID videoId) {
        courseService.removeVideoFromTopic(topicId, videoId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/topics/{topicId}/videos/reorder")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> reorderTopicVideos(
            @PathVariable UUID topicId,
            @Valid @RequestBody ReorderRequest request) {
        courseService.reorderTopicVideos(topicId, request);
        return ResponseEntity.ok().build();
    }

    // --- Authenticated / Shared Endpoints ---

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseResponse>> getCourses() {
        return ResponseEntity.ok(courseService.getCourses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourse(id));
    }

    @GetMapping("/topics/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TopicResponse> getTopic(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getTopic(id));
    }

    // --- Quiz & Progress APIs (Admin) ---

    @PostMapping("/topics/{topicId}/quiz")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TopicQuizResponse> createOrUpdateQuiz(
            @PathVariable UUID topicId,
            @Valid @RequestBody TopicQuizRequest request) {
        return ResponseEntity.ok(courseService.createOrUpdateQuiz(topicId, request));
    }

    // --- Quiz & Progress APIs (Student & Shared) ---

    @GetMapping("/topics/{topicId}/quiz")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TopicQuizResponse> getQuiz(@PathVariable UUID topicId) {
        return ResponseEntity.ok(courseService.getQuiz(topicId));
    }

    @PostMapping("/topics/{topicId}/quiz/submit")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(
            @PathVariable UUID topicId,
            @Valid @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(courseService.submitQuiz(topicId, request));
    }

    @GetMapping("/topics/{topicId}/progress")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<TopicProgressResponse> getTopicProgress(@PathVariable UUID topicId) {
        return ResponseEntity.ok(courseService.getTopicProgress(topicId));
    }

    @PostMapping("/topics/{topicId}/progress/reel")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<TopicProgressResponse> updateReelProgress(
            @PathVariable UUID topicId,
            @Valid @RequestBody ReelProgressRequest request) {
        return ResponseEntity.ok(courseService.updateReelProgress(topicId, request));
    }

    @PostMapping("/topics/{topicId}/progress/video")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<TopicProgressResponse> updateVideoProgress(
            @PathVariable UUID topicId,
            @Valid @RequestBody TopicVideoProgressRequest request) {
        return ResponseEntity.ok(courseService.updateVideoProgress(topicId, request));
    }

    @GetMapping("/{courseId}/certificate-eligibility")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<CertificateEligibilityResponse> getCertificateEligibility(
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCertificateEligibility(courseId));
    }

    // --- Student Endpoints ---

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> enroll(@PathVariable UUID id) {
        courseService.enroll(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> updateProgress(
            @PathVariable UUID id,
            @Valid @RequestBody CourseProgressRequest request) {
        courseService.updateProgress(id, request);
        return ResponseEntity.ok().build();
    }
}
