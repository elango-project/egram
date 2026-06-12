package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_reals", indexes = {
        @Index(name = "idx_saved_reals_real", columnList = "real_id"),
        @Index(name = "idx_saved_reals_student", columnList = "student_id")
})
@IdClass(SavedRealId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedReal {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "real_id", nullable = false)
    private Real real;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
}
