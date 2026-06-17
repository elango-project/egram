package com.egram.controller;

import com.egram.dto.CommentRequest;
import com.egram.dto.CommentResponse;
import com.egram.dto.RealRequest;
import com.egram.dto.RealResponse;
import com.egram.service.RealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reals")
@RequiredArgsConstructor
public class RealController {

    private final RealService realService;

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RealResponse> uploadReal(@Valid @RequestBody RealRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(realService.uploadReal(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteReal(@PathVariable UUID id) {
        realService.deleteReal(id);
        return ResponseEntity.noContent().build();
    }

    // --- Student / Shared Endpoints ---

    @GetMapping
    public ResponseEntity<com.egram.dto.PageResponse<RealResponse>> getAllReals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(realService.getAllReals(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RealResponse> getRealById(@PathVariable UUID id) {
        return ResponseEntity.ok(realService.getRealById(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable UUID id) {
        realService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> likeReal(@PathVariable UUID id) {
        realService.likeReal(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> unlikeReal(@PathVariable UUID id) {
        realService.unlikeReal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> saveReal(@PathVariable UUID id) {
        realService.saveReal(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Void> unsaveReal(@PathVariable UUID id) {
        realService.unsaveReal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(realService.addComment(id, request));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(realService.getComments(id));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        realService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
