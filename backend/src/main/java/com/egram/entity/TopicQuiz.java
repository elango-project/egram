package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "topic_quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false, unique = true)
    private Topic topic;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "passing_percentage", nullable = false)
    @Builder.Default
    private Integer passingPercentage = 70;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 3;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TopicQuestion> questions = new ArrayList<>();
}
