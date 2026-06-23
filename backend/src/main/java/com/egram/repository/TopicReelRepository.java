package com.egram.repository;

import com.egram.entity.TopicReel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicReelRepository extends JpaRepository<TopicReel, UUID> {
    List<TopicReel> findByTopicIdOrderByReelOrder(UUID topicId);
    Optional<TopicReel> findByTopicIdAndReelId(UUID topicId, UUID reelId);
}
