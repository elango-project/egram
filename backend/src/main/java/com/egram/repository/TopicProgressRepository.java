package com.egram.repository;

import com.egram.entity.TopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface TopicProgressRepository extends JpaRepository<TopicProgress, UUID> {
    Optional<TopicProgress> findByTopicIdAndStudentId(UUID topicId, UUID studentId);
    List<TopicProgress> findByTopicModuleCourseIdAndStudentId(UUID courseId, UUID studentId);
}
