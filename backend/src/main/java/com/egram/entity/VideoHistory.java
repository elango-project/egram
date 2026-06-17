package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "video_history", indexes = {
    @Index(name = "idx_video_history_student_video", columnList = "student_id, video_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private LongFormVideo video;

    @Column(name = "current_position_seconds", nullable = false)
    private Long currentPositionSeconds;

    @Column(name = "percentage_watched", nullable = false)
    private Double percentageWatched;

    @Column(name = "last_watched_at", nullable = false)
    private LocalDateTime lastWatchedAt;

    @Column(name = "completed", nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "playback_speed")
    @Builder.Default
    private Double playbackSpeed = 1.0;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastWatchedAt = LocalDateTime.now();
    }
}
