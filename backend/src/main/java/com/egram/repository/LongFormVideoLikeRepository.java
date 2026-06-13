package com.egram.repository;

import com.egram.entity.LongFormVideoLike;
import com.egram.entity.LongFormVideoLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LongFormVideoLikeRepository extends JpaRepository<LongFormVideoLike, LongFormVideoLikeId> {
    boolean existsByVideoIdAndStudentId(UUID videoId, UUID studentId);
    void deleteByVideoIdAndStudentId(UUID videoId, UUID studentId);
    long countByVideoId(UUID videoId);
    void deleteByVideoId(UUID videoId);
}
