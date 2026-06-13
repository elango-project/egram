package com.egram.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollments", indexes = {
        @Index(name = "idx_course_enrollments_course", columnList = "course_id"),
        @Index(name = "idx_course_enrollments_student", columnList = "student_id")
})
@IdClass(CourseEnrollmentId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEnrollment {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "completed_modules", nullable = false)
    @Builder.Default
    private Integer completedModules = 0;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
    }
}
