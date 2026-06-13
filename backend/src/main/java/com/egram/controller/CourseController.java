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
