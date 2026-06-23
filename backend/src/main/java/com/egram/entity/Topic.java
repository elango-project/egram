package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_topics", indexes = {
        @Index(name = "idx_course_topics_module", columnList = "module_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "topic_order", nullable = false)
    private Integer topicOrder;

    @Column(name = "has_quick_learning_path", nullable = false)
    @Builder.Default
    private Boolean hasQuickLearningPath = false;

    @Column(name = "has_deep_learning_path", nullable = false)
    @Builder.Default
    private Boolean hasDeepLearningPath = false;

    @Column(name = "has_quiz", nullable = false)
    @Builder.Default
    private Boolean hasQuiz = false;

    @Column(name = "has_assessment", nullable = false)
    @Builder.Default
    private Boolean hasAssessment = false;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<TopicReel> topicReels = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<TopicVideo> topicVideos = new java.util.ArrayList<>();
}
