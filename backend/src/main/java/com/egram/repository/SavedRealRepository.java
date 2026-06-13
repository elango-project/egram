package com.egram.repository;

import com.egram.entity.SavedReal;
import com.egram.entity.SavedRealId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedRealRepository extends JpaRepository<SavedReal, SavedRealId> {
    boolean existsByRealIdAndStudentId(UUID realId, UUID studentId);
    void deleteByRealIdAndStudentId(UUID realId, UUID studentId);
    void deleteByRealId(UUID realId);
}
