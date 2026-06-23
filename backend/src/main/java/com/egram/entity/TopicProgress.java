package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "topic_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "reels_completed", nullable = false)
    @Builder.Default
    private Boolean reelsCompleted = false;

    @Column(name = "video_completed", nullable = false)
    @Builder.Default
    private Boolean videoCompleted = false;

    @Column(name = "quiz_unlocked", nullable = false)
    @Builder.Default
    private Boolean quizUnlocked = false;

    @Column(name = "quiz_completed", nullable = false)
    @Builder.Default
    private Boolean quizCompleted = false;

    @Column(name = "topic_completed", nullable = false)
    @Builder.Default
    private Boolean topicCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
