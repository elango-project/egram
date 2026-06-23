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
    private final TopicReelRepository topicReelRepository;
    private final RealRepository realRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final TopicProgressRepository topicProgressRepository;
    private final TopicReelProgressRepository topicReelProgressRepository;
    private final TopicQuizRepository topicQuizRepository;
    private final TopicQuestionRepository topicQuestionRepository;
    private final TopicQuizAttemptRepository topicQuizAttemptRepository;

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

    @Transactional
    public TopicReelResponse addReelToTopic(UUID topicId, TopicReelRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EgramException("Topic not found", HttpStatus.NOT_FOUND));

        Real reel = realRepository.findById(request.getReelId())
                .orElseThrow(() -> new EgramException("Reel not found", HttpStatus.NOT_FOUND));

        if (topicReelRepository.findByTopicIdAndReelId(topicId, reel.getId()).isPresent()) {
            throw new EgramException("Reel is already attached to this topic", HttpStatus.BAD_REQUEST);
        }

        TopicReel topicReel = TopicReel.builder()
                .topic(topic)
                .reel(reel)
                .reelOrder(request.getReelOrder())
                .build();

        topicReel = topicReelRepository.save(topicReel);

        return TopicReelResponse.builder()
                .id(topicReel.getId())
                .reelId(reel.getId())
                .title(reel.getTitle())
                .thumbnailUrl(reel.getThumbnailUrl())
                .reelOrder(topicReel.getReelOrder())
                .build();
    }

    @Transactional
    public void removeReelFromTopic(UUID topicId, UUID reelId) {
        TopicReel topicReel = topicReelRepository.findByTopicIdAndReelId(topicId, reelId)
                .orElseThrow(() -> new EgramException("Reel not attached to this topic", HttpStatus.NOT_FOUND));
        topicReelRepository.delete(topicReel);
    }

    // --- Authenticated / Shared ---

    @Transactional(readOnly = true)
    public TopicResponse getTopic(UUID topicId) {
        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new EgramException("Topic not found", HttpStatus.NOT_FOUND));
        
        List<TopicReelResponse> reelResponses = t.getTopicReels() != null ? t.getTopicReels().stream()
                .sorted(java.util.Comparator.comparingInt(TopicReel::getReelOrder))
                .map(tr -> TopicReelResponse.builder()
                        .id(tr.getId())
                        .reelId(tr.getReel().getId())
                        .title(tr.getReel().getTitle())
                        .thumbnailUrl(tr.getReel().getThumbnailUrl())
                        .reelOrder(tr.getReelOrder())
                        .build())
                .collect(Collectors.toList()) : new java.util.ArrayList<>();

        return TopicResponse.builder()
            .id(t.getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .estimatedDurationMinutes(t.getEstimatedDurationMinutes())
            .topicOrder(t.getTopicOrder())
            .hasQuickLearningPath(t.getHasQuickLearningPath())
            .hasDeepLearningPath(t.getHasDeepLearningPath())
            .hasQuiz(t.getHasQuiz())
            .hasAssessment(t.getHasAssessment())
            .reels(reelResponses)
            .build();
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

    // --- Quiz APIs ---

    @Transactional
    public TopicQuizResponse createOrUpdateQuiz(UUID topicId, TopicQuizRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EgramException("Topic not found", HttpStatus.NOT_FOUND));

        TopicQuiz quiz = topicQuizRepository.findByTopicId(topicId).orElse(TopicQuiz.builder()
                .topic(topic)
                .build());

        quiz.setTitle(request.getTitle());
        quiz.setPassingPercentage(request.getPassingPercentage());
        quiz.setMaxAttempts(request.getMaxAttempts());

        if (quiz.getQuestions() != null) {
            quiz.getQuestions().clear();
        } else {
            quiz.setQuestions(new java.util.ArrayList<>());
        }

        if (request.getQuestions() != null) {
            for (TopicQuestionRequest qReq : request.getQuestions()) {
                quiz.getQuestions().add(TopicQuestion.builder()
                        .quiz(quiz)
                        .question(qReq.getQuestion())
                        .optionA(qReq.getOptionA())
                        .optionB(qReq.getOptionB())
                        .optionC(qReq.getOptionC())
                        .optionD(qReq.getOptionD())
                        .correctAnswer(qReq.getCorrectAnswer())
                        .explanation(qReq.getExplanation())
                        .build());
            }
        }

        quiz = topicQuizRepository.save(quiz);

        topic.setHasQuiz(true);
        topicRepository.save(topic);

        return mapQuizToResponse(quiz);
    }

    @Transactional(readOnly = true)
    public TopicQuizResponse getQuiz(UUID topicId) {
        TopicQuiz quiz = topicQuizRepository.findByTopicId(topicId)
                .orElseThrow(() -> new EgramException("Quiz not found for this topic", HttpStatus.NOT_FOUND));
        return mapQuizToResponse(quiz);
    }

    private TopicQuizResponse mapQuizToResponse(TopicQuiz quiz) {
        List<TopicQuestionResponse> questions = quiz.getQuestions().stream()
                .map(q -> TopicQuestionResponse.builder()
                        .id(q.getId())
                        .question(q.getQuestion())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctAnswer(q.getCorrectAnswer())
                        .explanation(q.getExplanation())
                        .build())
                .collect(Collectors.toList());

        return TopicQuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .passingPercentage(quiz.getPassingPercentage())
                .maxAttempts(quiz.getMaxAttempts())
                .questions(questions)
                .build();
    }

    // --- Progress APIs ---

    @Transactional
    public TopicProgressResponse getTopicProgress(UUID topicId) {
        User student = getCurrentUser();
        TopicProgress tp = topicProgressRepository.findByTopicIdAndStudentId(topicId, student.getId())
                .orElse(createInitialTopicProgress(topicId, student));
        return mapTopicProgressToResponse(tp);
    }

    private TopicProgress createInitialTopicProgress(UUID topicId, User student) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EgramException("Topic not found", HttpStatus.NOT_FOUND));
        TopicProgress tp = TopicProgress.builder()
                .student(student)
                .topic(topic)
                .build();
        return topicProgressRepository.save(tp);
    }

    private TopicProgressResponse mapTopicProgressToResponse(TopicProgress tp) {
        return TopicProgressResponse.builder()
                .id(tp.getId())
                .topicId(tp.getTopic().getId())
                .reelsCompleted(tp.getReelsCompleted())
                .videoCompleted(tp.getVideoCompleted())
                .quizUnlocked(tp.getQuizUnlocked())
                .quizCompleted(tp.getQuizCompleted())
                .topicCompleted(tp.getTopicCompleted())
                .completedAt(tp.getCompletedAt())
                .build();
    }

    @Transactional
    public TopicProgressResponse updateReelProgress(UUID topicId, ReelProgressRequest request) {
        User student = getCurrentUser();
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EgramException("Topic not found", HttpStatus.NOT_FOUND));
        Real reel = realRepository.findById(request.getReelId())
                .orElseThrow(() -> new EgramException("Reel not found", HttpStatus.NOT_FOUND));

        TopicReelProgress trp = topicReelProgressRepository.findByTopicIdAndReelIdAndStudentId(topicId, reel.getId(), student.getId())
                .orElse(TopicReelProgress.builder()
                        .student(student)
                        .topic(topic)
                        .reel(reel)
                        .build());

        trp.setWatchPercentage(Math.max(trp.getWatchPercentage(), request.getWatchPercentage()));
        
        if (trp.getWatchPercentage() >= 90 && !trp.getCompleted()) {
            trp.setCompleted(true);
            trp.setCompletedAt(java.time.LocalDateTime.now());
        }
        topicReelProgressRepository.save(trp);

        TopicProgress tp = topicProgressRepository.findByTopicIdAndStudentId(topicId, student.getId())
                .orElse(createInitialTopicProgress(topicId, student));

        // Check if all reels are completed
        List<TopicReel> allReels = topicReelRepository.findByTopicIdOrderByReelOrder(topicId);
        List<TopicReelProgress> completedReels = topicReelProgressRepository.findByTopicIdAndStudentId(topicId, student.getId())
                .stream().filter(TopicReelProgress::getCompleted).toList();

        if (allReels.size() > 0 && completedReels.size() >= allReels.size()) {
            tp.setReelsCompleted(true);
            tp.setQuizUnlocked(true);
            topicProgressRepository.save(tp);
            checkTopicCompletion(tp);
        }

        return mapTopicProgressToResponse(tp);
    }

    @Transactional
    public QuizAttemptResponse submitQuiz(UUID topicId, QuizSubmitRequest request) {
        User student = getCurrentUser();
        TopicQuiz quiz = topicQuizRepository.findByTopicId(topicId)
                .orElseThrow(() -> new EgramException("Quiz not found", HttpStatus.NOT_FOUND));
        TopicProgress tp = topicProgressRepository.findByTopicIdAndStudentId(topicId, student.getId())
                .orElseThrow(() -> new EgramException("No progress found. Watch a learning path first.", HttpStatus.BAD_REQUEST));

        if (!tp.getQuizUnlocked()) {
            throw new EgramException("Quiz is locked. Complete a learning path first.", HttpStatus.BAD_REQUEST);
        }

        List<TopicQuizAttempt> previousAttempts = topicQuizAttemptRepository.findByQuizIdAndStudentIdOrderBySubmittedAtDesc(quiz.getId(), student.getId());
        if (previousAttempts.size() >= quiz.getMaxAttempts()) {
            throw new EgramException("Maximum attempts reached for this quiz.", HttpStatus.BAD_REQUEST);
        }

        int correctAnswers = 0;
        int totalQuestions = quiz.getQuestions().size();

        for (TopicQuestion q : quiz.getQuestions()) {
            String studentAnswer = request.getAnswers().get(q.getId());
            if (studentAnswer != null && studentAnswer.equalsIgnoreCase(q.getCorrectAnswer())) {
                correctAnswers++;
            }
        }

        int score = totalQuestions > 0 ? (int) Math.round(((double) correctAnswers / totalQuestions) * 100) : 0;
        boolean passed = score >= quiz.getPassingPercentage();

        TopicQuizAttempt attempt = TopicQuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswers)
                .score(score)
                .passed(passed)
                .submittedAt(java.time.LocalDateTime.now())
                .build();

        attempt = topicQuizAttemptRepository.save(attempt);

        if (passed && !tp.getQuizCompleted()) {
            tp.setQuizCompleted(true);
            topicProgressRepository.save(tp);
            checkTopicCompletion(tp);
        }

        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .totalQuestions(attempt.getTotalQuestions())
                .correctAnswers(attempt.getCorrectAnswers())
                .score(attempt.getScore())
                .passed(attempt.getPassed())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    private void checkTopicCompletion(TopicProgress tp) {
        if (!tp.getTopicCompleted() && (tp.getReelsCompleted() || tp.getVideoCompleted()) && tp.getQuizCompleted()) {
            tp.setTopicCompleted(true);
            tp.setCompletedAt(java.time.LocalDateTime.now());
            topicProgressRepository.save(tp);

            // Update course progress dynamically
            updateCourseProgress(tp.getTopic().getModule().getCourse(), tp.getStudent());
        }
    }

    private void updateCourseProgress(Course course, User student) {
        CourseProgress cp = courseProgressRepository.findByCourseIdAndStudentId(course.getId(), student.getId())
                .orElse(CourseProgress.builder()
                        .student(student)
                        .course(course)
                        .build());
        
        List<TopicProgress> topicProgressList = topicProgressRepository.findByTopicModuleCourseIdAndStudentId(course.getId(), student.getId());
        long completedTopicsCount = topicProgressList.stream().filter(TopicProgress::getTopicCompleted).count();
        long totalTopicsCount = course.getModules().stream().flatMap(m -> m.getTopics().stream()).count();

        if (completedTopicsCount >= totalTopicsCount && totalTopicsCount > 0 && !cp.getCompleted()) {
            cp.setCompleted(true);
            cp.setCompletedAt(java.time.LocalDateTime.now());
        }
        courseProgressRepository.save(cp);
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
                            .map(t -> {
                                List<TopicReelResponse> reelResponses = t.getTopicReels() != null ? t.getTopicReels().stream()
                                        .sorted(java.util.Comparator.comparingInt(TopicReel::getReelOrder))
                                        .map(tr -> TopicReelResponse.builder()
                                                .id(tr.getId())
                                                .reelId(tr.getReel().getId())
                                                .title(tr.getReel().getTitle())
                                                .thumbnailUrl(tr.getReel().getThumbnailUrl())
                                                .reelOrder(tr.getReelOrder())
                                                .build())
                                        .collect(Collectors.toList()) : new java.util.ArrayList<>();

                                return TopicResponse.builder()
                                    .id(t.getId())
                                    .title(t.getTitle())
                                    .description(t.getDescription())
                                    .estimatedDurationMinutes(t.getEstimatedDurationMinutes())
                                    .topicOrder(t.getTopicOrder())
                                    .hasQuickLearningPath(t.getHasQuickLearningPath())
                                    .hasDeepLearningPath(t.getHasDeepLearningPath())
                                    .hasQuiz(t.getHasQuiz())
                                    .hasAssessment(t.getHasAssessment())
                                    .reels(reelResponses)
                                    .build();
                            })
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
