package com.egram.repository;

import com.egram.entity.LongFormVideoComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LongFormVideoCommentRepository extends JpaRepository<LongFormVideoComment, UUID> {
    List<LongFormVideoComment> findByVideoIdOrderByCreatedAtDesc(UUID videoId);
    void deleteByVideoId(UUID videoId);
}
