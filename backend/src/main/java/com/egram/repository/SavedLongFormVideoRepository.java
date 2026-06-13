package com.egram.repository;

import com.egram.entity.SavedLongFormVideo;
import com.egram.entity.SavedLongFormVideoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SavedLongFormVideoRepository extends JpaRepository<SavedLongFormVideo, SavedLongFormVideoId> {
    boolean existsByVideoIdAndStudentId(UUID videoId, UUID studentId);
    void deleteByVideoIdAndStudentId(UUID videoId, UUID studentId);
    void deleteByVideoId(UUID videoId);
}
