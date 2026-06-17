package com.egram.repository;

import com.egram.entity.JobApplication;
import com.egram.entity.JobApplicationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, JobApplicationId> {
    boolean existsByJobIdAndStudentId(UUID jobId, UUID studentId);
    List<JobApplication> findByStudentId(UUID studentId);
    void deleteByJobId(UUID jobId);
}
