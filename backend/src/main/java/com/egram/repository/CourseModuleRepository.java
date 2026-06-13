package com.egram.repository;

import com.egram.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {
    List<CourseModule> findByCourseIdOrderByModuleOrder(UUID courseId);
    void deleteByCourseId(UUID courseId);
}
