package com.egram.repository;

import com.egram.entity.RealComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RealCommentRepository extends JpaRepository<RealComment, UUID> {
    List<RealComment> findByRealIdOrderByCreatedAtDesc(UUID realId);
}
