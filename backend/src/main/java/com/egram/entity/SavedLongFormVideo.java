package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_long_form_videos", indexes = {
        @Index(name = "idx_saved_lfv_video", columnList = "video_id"),
        @Index(name = "idx_saved_lfv_student", columnList = "student_id")
})
@IdClass(SavedLongFormVideoId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedLongFormVideo {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private LongFormVideo video;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
}
