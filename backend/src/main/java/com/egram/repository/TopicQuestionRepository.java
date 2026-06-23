package com.egram.repository;

import com.egram.entity.TopicQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface TopicQuestionRepository extends JpaRepository<TopicQuestion, UUID> {
    List<TopicQuestion> findByQuizId(UUID quizId);
}
