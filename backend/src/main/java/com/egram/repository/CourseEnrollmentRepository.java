package com.egram.repository;

import com.egram.entity.CourseEnrollment;
import com.egram.entity.CourseEnrollmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, CourseEnrollmentId> {
    boolean existsByCourseIdAndStudentId(UUID courseId, UUID studentId);
    Optional<CourseEnrollment> findByCourseIdAndStudentId(UUID courseId, UUID studentId);
    void deleteByCourseId(UUID courseId);
}
