package com.egram.repository;

import com.egram.entity.TopicReelProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface TopicReelProgressRepository extends JpaRepository<TopicReelProgress, UUID> {
    Optional<TopicReelProgress> findByTopicIdAndReelIdAndStudentId(UUID topicId, UUID reelId, UUID studentId);
    List<TopicReelProgress> findByTopicIdAndStudentId(UUID topicId, UUID studentId);
}
