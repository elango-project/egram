package com.egram.repository;

import com.egram.entity.LongFormVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LongFormVideoRepository extends JpaRepository<LongFormVideo, UUID> {
}
