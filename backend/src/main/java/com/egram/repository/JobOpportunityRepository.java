package com.egram.repository;

import com.egram.entity.JobOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobOpportunityRepository extends JpaRepository<JobOpportunity, UUID> {
    List<JobOpportunity> findByActiveTrueOrderByCreatedAtDesc();
    List<JobOpportunity> findByTypeAndActiveTrueOrderByCreatedAtDesc(String type);
    List<JobOpportunity> findAllByOrderByCreatedAtDesc();
}
