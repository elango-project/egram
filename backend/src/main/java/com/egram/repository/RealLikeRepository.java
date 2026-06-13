package com.egram.repository;

import com.egram.entity.RealLike;
import com.egram.entity.RealLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RealLikeRepository extends JpaRepository<RealLike, RealLikeId> {
    boolean existsByRealIdAndStudentId(UUID realId, UUID studentId);
    void deleteByRealIdAndStudentId(UUID realId, UUID studentId);
    long countByRealId(UUID realId);
    void deleteByRealId(UUID realId);
}
