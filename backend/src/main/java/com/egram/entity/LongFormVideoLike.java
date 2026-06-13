package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "long_form_video_likes", indexes = {
        @Index(name = "idx_lfv_likes_video", columnList = "video_id"),
        @Index(name = "idx_lfv_likes_student", columnList = "student_id")
})
@IdClass(LongFormVideoLikeId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LongFormVideoLike {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private LongFormVideo video;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
}
