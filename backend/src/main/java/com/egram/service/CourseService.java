package com.egram.service;

import com.egram.dto.*;
import com.egram.entity.*;
import com.egram.exception.EgramException;
import com.egram.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Course getCourseOrThrow(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EgramException("Course not found", HttpStatus.NOT_FOUND));
    }

    // --- Admin ---

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        User admin = getCurrentUser();
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .createdBy(admin)
                .build();
        
        course = courseRepository.save(course);
        return mapToResponse(course, admin);
    }

    @Transactional
    public CourseResponse updateCourse(UUID id, CourseRequest request) {
        Course course = getCourseOrThrow(id);
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course = courseRepository.save(course);
        return mapToResponse(course, getCurrentUser());
    }

    @Transactional
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new EgramException("Course not found", HttpStatus.NOT_FOUND);
        }
        // Cascade delete using our repositories
        courseEnrollmentRepository.deleteByCourseId(id);
        courseModuleRepository.deleteByCourseId(id);
        courseRepository.deleteById(id);
    }

    @Transactional
    public CourseModuleResponse addModule(UUID courseId, CourseModuleRequest request) {
        Course course = getCourseOrThrow(courseId);

        // Validation rule: Exactly one of realId or longFormVideoId must be present
        boolean hasReal = request.getRealId() != null;
        boolean hasVideo = request.getLongFormVideoId() != null;

        if ((hasReal && hasVideo) || (!hasReal && !hasVideo)) {
            throw new EgramException("Exactly one of realId or longFormVideoId must be provided", HttpStatus.BAD_REQUEST);
        }

        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.getTitle())
                .moduleOrder(request.getModuleOrder())
                .realId(request.getRealId())
                .longFormVideoId(request.getLongFormVideoId())
                .build();

        module = courseModuleRepository.save(module);

        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .moduleOrder(module.getModuleOrder())
                .realId(module.getRealId())
                .longFormVideoId(module.getLongFormVideoId())
                .build();
    }

    @Transactional
    public void removeModule(UUID moduleId) {
        if (!courseModuleRepository.existsById(moduleId)) {
            throw new EgramException("Course module not found", HttpStatus.NOT_FOUND);
        }
        courseModuleRepository.deleteById(moduleId);
    }

    // --- Authenticated / Student ---

    @Transactional(readOnly = true)
    public List<CourseResponse> getCourses() {
        User currentUser = getCurrentUser();
        return courseRepository.findAll().stream()
                .map(course -> mapToResponse(course, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(UUID id) {
        Course course = getCourseOrThrow(id);
        return mapToResponse(course, getCurrentUser());
    }

    @Transactional
    public void enroll(UUID courseId) {
        User student = getCurrentUser();
        Course course = getCourseOrThrow(courseId);

        if (courseEnrollmentRepository.existsByCourseIdAndStudentId(courseId, student.getId())) {
            throw new EgramException("Already enrolled in this course", HttpStatus.BAD_REQUEST);
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .course(course)
                .student(student)
                .completedModules(0)
                .build();
        
        courseEnrollmentRepository.save(enrollment);
    }

    @Transactional
    public void updateProgress(UUID courseId, CourseProgressRequest request) {
        User student = getCurrentUser();

        CourseEnrollment enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, student.getId())
                .orElseThrow(() -> new EgramException("Student not enrolled in this course", HttpStatus.NOT_FOUND));

        int totalModules = courseModuleRepository.findByCourseIdOrderByModuleOrder(courseId).size();
        
        if (request.getCompletedModules() > totalModules) {
            throw new EgramException("Completed modules cannot exceed total modules", HttpStatus.BAD_REQUEST);
        }

        enrollment.setCompletedModules(request.getCompletedModules());
        courseEnrollmentRepository.save(enrollment);
    }

    private CourseResponse mapToResponse(Course course, User currentUser) {
        int totalModules = courseModuleRepository.findByCourseIdOrderByModuleOrder(course.getId()).size();
        
        boolean isEnrolled = false;
        int progressPercentage = 0;
        
        if ("STUDENT".equals(currentUser.getRole().name())) {
            Optional<CourseEnrollment> enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(course.getId(), currentUser.getId());
            if (enrollment.isPresent()) {
                isEnrolled = true;
                int completed = enrollment.get().getCompletedModules();
                if (totalModules > 0) {
                    progressPercentage = (int) (((double) completed / totalModules) * 100);
                }
            }
        }

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .createdBy(course.getCreatedBy().getFullName())
                .totalModules(totalModules)
                .enrolled(isEnrolled)
                .progressPercentage(progressPercentage)
                .createdAt(course.getCreatedAt())
                .build();
    }
}
