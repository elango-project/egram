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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final CourseRepository courseRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Assessment getAssessmentOrThrow(UUID id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new EgramException("Assessment not found", HttpStatus.NOT_FOUND));
    }

    // --- Admin Endpoints ---

    @Transactional
    public AssessmentResponse createAssessment(AssessmentRequest request) {
        User admin = getCurrentUser();
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new EgramException("Course not found", HttpStatus.NOT_FOUND));
        }

        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .passingPercentage(request.getPassingPercentage())
                .course(course)
                .createdBy(admin)
                .build();
        
        assessment = assessmentRepository.save(assessment);
        return mapToResponse(assessment);
    }

    @Transactional
    public AssessmentResponse updateAssessment(UUID id, AssessmentRequest request) {
        Assessment assessment = getAssessmentOrThrow(id);
        
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new EgramException("Course not found", HttpStatus.NOT_FOUND));
        }

        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setDurationMinutes(request.getDurationMinutes());
        assessment.setPassingPercentage(request.getPassingPercentage());
        assessment.setCourse(course);
        
        assessment = assessmentRepository.save(assessment);
        return mapToResponse(assessment);
    }

    @Transactional
    public void deleteAssessment(UUID id) {
        if (!assessmentRepository.existsById(id)) {
            throw new EgramException("Assessment not found", HttpStatus.NOT_FOUND);
        }
        attemptRepository.deleteByAssessmentId(id);
        questionRepository.deleteByAssessmentId(id);
        assessmentRepository.deleteById(id);
    }

    @Transactional
    public AssessmentQuestionResponse addQuestion(UUID assessmentId, AssessmentQuestionRequest request) {
        Assessment assessment = getAssessmentOrThrow(assessmentId);

        AssessmentQuestion question = AssessmentQuestion.builder()
                .assessment(assessment)
                .question(request.getQuestion())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctAnswer(request.getCorrectAnswer())
                .build();

        question = questionRepository.save(question);
        return mapToQuestionResponse(question);
    }

    @Transactional
    public void removeQuestion(UUID questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new EgramException("Question not found", HttpStatus.NOT_FOUND);
        }
        questionRepository.deleteById(questionId);
    }

    // --- Authenticated Endpoints ---

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessments() {
        return assessmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentResponse getAssessment(UUID id) {
        return mapToResponse(getAssessmentOrThrow(id));
    }

    // --- Student Endpoints ---

    @Transactional(readOnly = true)
    public List<AssessmentQuestionResponse> getQuestionsForStudent(UUID assessmentId) {
        getAssessmentOrThrow(assessmentId);
        return questionRepository.findByAssessmentId(assessmentId).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultResponse submitAssessment(UUID id, AssessmentSubmissionRequest request) {
        User student = getCurrentUser();
        Assessment assessment = getAssessmentOrThrow(id);

        List<AssessmentQuestion> questions = questionRepository.findByAssessmentId(id);
        int totalQuestions = questions.size();
        
        if (totalQuestions == 0) {
            throw new EgramException("Assessment has no questions", HttpStatus.BAD_REQUEST);
        }

        java.time.LocalDateTime startedAt = null;
        if (request.getStartedAt() != null) {
            try {
                // Parse ISO string (which might contain 'Z' or offset) properly
                java.time.Instant instant = java.time.Instant.parse(request.getStartedAt());
                startedAt = java.time.LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
            } catch (Exception e) {
                // ignore or handle
            }
        }
        
        java.time.LocalDateTime submittedAt = java.time.LocalDateTime.now();

        // Server-side timer validation
        if (startedAt != null && assessment.getDurationMinutes() != null && assessment.getDurationMinutes() > 0) {
            long diffSeconds = java.time.Duration.between(startedAt, submittedAt).getSeconds();
            long maxSeconds = assessment.getDurationMinutes() * 60 + 30; // 30 seconds grace period
            if (diffSeconds > maxSeconds) {
                // We could reject, but let's just log or throw. For MVP let's throw.
                throw new EgramException("Time limit exceeded for assessment", HttpStatus.BAD_REQUEST);
            }
        }

        int score = 0;
        for (AssessmentQuestion q : questions) {
            String studentAnswer = request.getAnswers().get(q.getId());
            if (studentAnswer != null && studentAnswer.equals(q.getCorrectAnswer())) {
                score++;
            }
        }

        int wrongAnswers = totalQuestions - score;
        int percentage = (int) Math.round(((double) score / totalQuestions) * 100);
        boolean passed = percentage >= assessment.getPassingPercentage();

        String questionOrderStr = null;
        if (request.getQuestionOrder() != null && !request.getQuestionOrder().isEmpty()) {
            questionOrderStr = String.join(",", request.getQuestionOrder());
        }

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .assessment(assessment)
                .student(student)
                .score(score)
                .percentage(percentage)
                .passed(passed)
                .totalQuestions(totalQuestions)
                .correctAnswers(score)
                .wrongAnswers(wrongAnswers)
                .questionOrder(questionOrderStr)
                .startedAt(startedAt != null ? startedAt : submittedAt)
                .submittedAt(submittedAt)
                .build();

        attempt = attemptRepository.save(attempt);

        return AssessmentResultResponse.builder()
                .assessmentId(assessment.getId())
                .score(score)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .passed(passed)
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AssessmentAttemptResponse> getAttemptHistory(UUID id) {
        User student = getCurrentUser();
        getAssessmentOrThrow(id);

        List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(id, student.getId());

        return attempts.stream().map(a -> {
            return AssessmentAttemptResponse.builder()
                .id(a.getId())
                .assessmentId(a.getAssessment().getId())
                .studentName(a.getStudent().getFullName())
                .score(a.getScore())
                .totalQuestions(a.getTotalQuestions())
                .correctAnswers(a.getCorrectAnswers())
                .wrongAnswers(a.getWrongAnswers())
                .percentage(a.getPercentage())
                .passed(a.getPassed())
                .questionOrder(a.getQuestionOrder())
                .startedAt(a.getStartedAt())
                .submittedAt(a.getSubmittedAt())
                .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentAnalyticsResponse getAnalytics(UUID id) {
        getAssessmentOrThrow(id);

        List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentId(id);

        long totalAttempts = attempts.size();
        if (totalAttempts == 0) {
            return AssessmentAnalyticsResponse.builder()
                    .totalAttempts(0)
                    .averageScore(0.0)
                    .passRate(0.0)
                    .highestScore(0)
                    .build();
        }

        double averageScore = attempts.stream().mapToInt(AssessmentAttempt::getScore).average().orElse(0.0);
        long passedCount = attempts.stream().filter(AssessmentAttempt::getPassed).count();
        double passRate = ((double) passedCount / totalAttempts) * 100;
        int highestScore = attempts.stream().mapToInt(AssessmentAttempt::getScore).max().orElse(0);

        return AssessmentAnalyticsResponse.builder()
                .totalAttempts(totalAttempts)
                .averageScore(Math.round(averageScore * 100.0) / 100.0)
                .passRate(Math.round(passRate * 100.0) / 100.0)
                .highestScore(highestScore)
                .build();
    }

    // --- Helpers ---

    private AssessmentResponse mapToResponse(Assessment assessment) {
        int totalQuestions = questionRepository.findByAssessmentId(assessment.getId()).size();
        String courseTitle = assessment.getCourse() != null ? assessment.getCourse().getTitle() : null;

        return AssessmentResponse.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .description(assessment.getDescription())
                .durationMinutes(assessment.getDurationMinutes())
                .passingPercentage(assessment.getPassingPercentage())
                .courseTitle(courseTitle)
                .totalQuestions(totalQuestions)
                .createdAt(assessment.getCreatedAt())
                .build();
    }

    private AssessmentQuestionResponse mapToQuestionResponse(AssessmentQuestion question) {
        return AssessmentQuestionResponse.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .build();
    }
}
