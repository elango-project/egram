package com.egram.repository;

import com.egram.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, UUID> {
    List<AssessmentQuestion> findByAssessmentId(UUID assessmentId);
    void deleteByAssessmentId(UUID assessmentId);
}
