package com.egram.repository;

import com.egram.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, UUID> {
    Optional<CourseProgress> findByCourseIdAndStudentId(UUID courseId, UUID studentId);
}
