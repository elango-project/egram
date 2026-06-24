package com.egram.repository;

import com.egram.entity.TopicVideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicVideoProgressRepository extends JpaRepository<TopicVideoProgress, UUID> {
    Optional<TopicVideoProgress> findByTopicIdAndVideoIdAndStudentId(UUID topicId, UUID videoId, UUID studentId);
    List<TopicVideoProgress> findByTopicIdAndStudentId(UUID topicId, UUID studentId);
}
