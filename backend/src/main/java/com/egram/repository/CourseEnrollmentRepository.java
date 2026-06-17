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
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CourseEnrollment c WHERE c.course.id = :courseId")
    void deleteByCourseId(@org.springframework.data.repository.query.Param("courseId") UUID courseId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM CourseEnrollment c WHERE c.course.id = :courseId")
    java.util.List<CourseEnrollment> findByCourseId(@org.springframework.data.repository.query.Param("courseId") UUID courseId);
}
