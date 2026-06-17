package com.egram.repository;

import com.egram.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, UUID> {
    boolean existsByAssessmentIdAndStudentId(UUID assessmentId, UUID studentId);
    Optional<AssessmentAttempt> findByAssessmentIdAndStudentId(UUID assessmentId, UUID studentId);
    List<AssessmentAttempt> findByStudentId(UUID studentId);
    void deleteByAssessmentId(UUID assessmentId);
}
