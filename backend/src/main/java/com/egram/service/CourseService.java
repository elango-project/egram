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
    private final TopicRepository topicRepository;

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
                .category(request.getCategory())
                .difficulty(request.getDifficulty())
                .durationMinutes(request.getDurationMinutes())
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
        course.setCategory(request.getCategory());
        course.setDifficulty(request.getDifficulty());
        course.setDurationMinutes(request.getDurationMinutes());
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

    @Transactional
    public TopicResponse addTopic(UUID moduleId, TopicRequest request) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new EgramException("Course module not found", HttpStatus.NOT_FOUND));

        Topic topic = Topic.builder()
                .module(module)
                .title(request.getTitle())
                .description(request.getDescription())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .topicOrder(request.getTopicOrder())
                .build();

        topic = topicRepository.save(topic);

        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .estimatedDurationMinutes(topic.getEstimatedDurationMinutes())
                .topicOrder(topic.getTopicOrder())
                .build();
    }

    @Transactional
    public void removeTopic(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new EgramException("Topic not found", HttpStatus.NOT_FOUND);
        }
        topicRepository.deleteById(topicId);
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
        int completedModules = 0;
        long enrollmentCount = 0;
        double completionRate = 0.0;
        
        if ("STUDENT".equals(currentUser.getRole().name())) {
            Optional<CourseEnrollment> enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(course.getId(), currentUser.getId());
            if (enrollment.isPresent()) {
                isEnrolled = true;
                completedModules = enrollment.get().getCompletedModules();
                if (totalModules > 0) {
                    progressPercentage = (int) (((double) completedModules / totalModules) * 100);
                }
            }
        } else if ("ADMIN".equals(currentUser.getRole().name())) {
            List<CourseEnrollment> allEnrollments = courseEnrollmentRepository.findByCourseId(course.getId());
            enrollmentCount = allEnrollments.size();
            if (enrollmentCount > 0 && totalModules > 0) {
                long completedCount = allEnrollments.stream()
                        .filter(e -> e.getCompletedModules() >= totalModules)
                        .count();
                completionRate = Math.round(((double) completedCount / enrollmentCount) * 100.0);
            }
        }

        List<CourseModuleResponse> modules = course.getModules().stream()
                .map(m -> {
                    List<TopicResponse> topicResponses = m.getTopics() != null ? m.getTopics().stream()
                            .sorted(java.util.Comparator.comparingInt(Topic::getTopicOrder))
                            .map(t -> TopicResponse.builder()
                                    .id(t.getId())
                                    .title(t.getTitle())
                                    .description(t.getDescription())
                                    .estimatedDurationMinutes(t.getEstimatedDurationMinutes())
                                    .topicOrder(t.getTopicOrder())
                                    .build())
                            .collect(Collectors.toList()) : new java.util.ArrayList<>();

                    return CourseModuleResponse.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .moduleOrder(m.getModuleOrder())
                        .realId(m.getRealId())
                        .longFormVideoId(m.getLongFormVideoId())
                        .topics(topicResponses)
                        .build();
                })
                .collect(Collectors.toList());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .category(course.getCategory())
                .difficulty(course.getDifficulty())
                .durationMinutes(course.getDurationMinutes())
                .createdBy(course.getCreatedBy().getFullName())
                .totalModules(totalModules)
                .completedModules(completedModules)
                .enrollmentCount(enrollmentCount)
                .completionRate(completionRate)
                .enrolled(isEnrolled)
                .progressPercentage(progressPercentage)
                .modules(modules)
                .createdAt(course.getCreatedAt())
                .build();
    }
}
