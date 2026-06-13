package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_modules", indexes = {
        @Index(name = "idx_course_modules_course", columnList = "course_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "module_order", nullable = false)
    private Integer moduleOrder;

    @Column(name = "real_id")
    private UUID realId;

    @Column(name = "long_form_video_id")
    private UUID longFormVideoId;
}
