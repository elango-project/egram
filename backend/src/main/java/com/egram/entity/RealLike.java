package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "real_likes", indexes = {
        @Index(name = "idx_real_likes_real", columnList = "real_id"),
        @Index(name = "idx_real_likes_student", columnList = "student_id")
})
@IdClass(RealLikeId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealLike {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "real_id", nullable = false)
    private Real real;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
}
