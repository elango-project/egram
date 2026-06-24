package com.egram.repository;

import com.egram.entity.TopicVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicVideoRepository extends JpaRepository<TopicVideo, UUID> {
    List<TopicVideo> findByTopicIdOrderByVideoOrder(UUID topicId);
    Optional<TopicVideo> findByTopicIdAndVideoId(UUID topicId, UUID videoId);
}
