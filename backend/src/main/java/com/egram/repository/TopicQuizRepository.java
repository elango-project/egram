package com.egram.repository;

import com.egram.entity.TopicQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicQuizRepository extends JpaRepository<TopicQuiz, UUID> {
    Optional<TopicQuiz> findByTopicId(UUID topicId);
}
