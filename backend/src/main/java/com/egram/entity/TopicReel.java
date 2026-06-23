package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "topic_reels", indexes = {
        @Index(name = "idx_topic_reels_topic", columnList = "topic_id"),
        @Index(name = "idx_topic_reels_reel", columnList = "reel_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicReel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id", nullable = false)
    private Real reel;

    @Column(name = "reel_order", nullable = false)
    private Integer reelOrder;
}
