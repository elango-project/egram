package com.egram.controller;

import com.egram.dto.LongFormVideoRequest;
import com.egram.dto.LongFormVideoResponse;
import com.egram.dto.VideoCommentRequest;
import com.egram.dto.VideoCommentResponse;
import com.egram.service.LongFormVideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/videos")
@RequiredArgsConstructor
public class LongFormVideoController {

    private final LongFormVideoService videoService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LongFormVideoResponse> uploadVideo(@Valid @RequestBody LongFormVideoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.uploadVideo(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVideo(@PathVariable UUID id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        videoService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<com.egram.dto.VideoAnalyticsResponse> getAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(videoService.getAnalytics(id));
    }

    // --- Student / Shared Endpoints ---

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.egram.dto.PageResponse<LongFormVideoResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.getFeed(page, size));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<LongFormVideoResponse>> searchVideos(@RequestParam String query) {
        return ResponseEntity.ok(videoService.searchVideos(query));
    }

    @GetMapping("/continue-watching")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<LongFormVideoResponse>> getContinueWatching() {
        return ResponseEntity.ok(videoService.getContinueWatching());
    }

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LongFormVideoResponse>> getRecommendations(@PathVariable UUID id) {
        return ResponseEntity.ok(videoService.getRecommendations(id));
    }

    @PostMapping("/{id}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> incrementViewCount(@PathVariable UUID id) {
        videoService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/progress")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<com.egram.dto.VideoProgressResponse> updateProgress(
            @PathVariable UUID id,
            @Valid @RequestBody com.egram.dto.VideoProgressRequest request) {
        return ResponseEntity.ok(videoService.updateProgress(id, request));
    }

    @GetMapping("/{id}/progress")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<com.egram.dto.VideoProgressResponse> getProgress(@PathVariable UUID id) {
        return ResponseEntity.ok(videoService.getProgress(id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LongFormVideoResponse> getVideo(@PathVariable UUID id) {
        return ResponseEntity.ok(videoService.getVideo(id));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> likeVideo(@PathVariable UUID id) {
        videoService.likeVideo(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> unlikeVideo(@PathVariable UUID id) {
        videoService.unlikeVideo(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> saveVideo(@PathVariable UUID id) {
        videoService.saveVideo(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> unsaveVideo(@PathVariable UUID id) {
        videoService.unsaveVideo(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<VideoCommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody VideoCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.addComment(id, request));
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VideoCommentResponse>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(videoService.getComments(id));
    }
}
