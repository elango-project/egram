package com.egram.repository;

import com.egram.entity.VideoHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoHistoryRepository extends JpaRepository<VideoHistory, UUID> {
    Optional<VideoHistory> findByStudentIdAndVideoId(UUID studentId, UUID videoId);

    @Query("SELECT vh FROM VideoHistory vh WHERE vh.student.id = :studentId AND vh.percentageWatched >= 10.0 AND vh.percentageWatched < 90.0 ORDER BY vh.lastWatchedAt DESC")
    Page<VideoHistory> findContinueWatching(UUID studentId, Pageable pageable);

    @Query("SELECT AVG(vh.percentageWatched) FROM VideoHistory vh WHERE vh.video.id = :videoId")
    Double getAveragePercentageWatchedByVideoId(UUID videoId);

    @Query("SELECT COUNT(vh) FROM VideoHistory vh WHERE vh.video.id = :videoId AND vh.completed = true")
    Long countCompletedByVideoId(UUID videoId);

    @Query("SELECT COUNT(vh) FROM VideoHistory vh WHERE vh.video.id = :videoId")
    Long countTotalWatchersByVideoId(UUID videoId);

    @Query("SELECT COUNT(vh) FROM VideoHistory vh WHERE vh.video.id = :videoId AND vh.percentageWatched >= 10.0 AND vh.percentageWatched < 90.0")
    Long countContinueWatchingByVideoId(UUID videoId);

    void deleteByVideoId(UUID videoId);
}
