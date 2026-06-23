package com.egram.repository;

import com.egram.entity.TopicQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicQuizAttemptRepository extends JpaRepository<TopicQuizAttempt, UUID> {
    List<TopicQuizAttempt> findByQuizIdAndStudentIdOrderBySubmittedAtDesc(UUID quizId, UUID studentId);
}
