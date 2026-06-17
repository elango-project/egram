package com.egram.repository;

import com.egram.entity.SavedJob;
import com.egram.entity.SavedJobId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {
    boolean existsByJobIdAndStudentId(UUID jobId, UUID studentId);
    List<SavedJob> findByStudentId(UUID studentId);
    void deleteByJobIdAndStudentId(UUID jobId, UUID studentId);
    void deleteByJobId(UUID jobId);
}
