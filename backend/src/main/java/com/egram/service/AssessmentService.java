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

import java.time.LocalDateTime;
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
    private final CertificateService certificateService;
    private final CourseService courseService;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Assessment getAssessmentOrThrow(UUID id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new EgramException("Assessment not found", HttpStatus.NOT_FOUND));
    }

    // --- Admin Endpoints ---

    @Transactional
    public AssessmentResponse createAssessment(UUID courseId, AssessmentRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EgramException("Course not found", HttpStatus.NOT_FOUND));

        if (assessmentRepository.findByCourseId(course.getId()).isPresent()) {
            throw new EgramException("Assessment already exists for this course", HttpStatus.BAD_REQUEST);
        }

        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .passingPercentage(request.getPassingPercentage())
                .maxAttempts(request.getMaxAttempts())
                .active(request.getActive() != null ? request.getActive() : true)
                .course(course)
                .createdBy(getCurrentUser())
                .build();
        
        assessment = assessmentRepository.save(assessment);

        if (request.getQuestions() != null) {
            for (AssessmentQuestionRequest qReq : request.getQuestions()) {
                AssessmentQuestion q = AssessmentQuestion.builder()
                        .assessment(assessment)
                        .question(qReq.getQuestion())
                        .optionA(qReq.getOptionA())
                        .optionB(qReq.getOptionB())
                        .optionC(qReq.getOptionC())
                        .optionD(qReq.getOptionD())
                        .correctAnswer(qReq.getCorrectAnswer())
                        .build();
                questionRepository.save(q);
                assessment.getQuestions().add(q);
            }
        }
        
        return mapToResponse(assessment);
    }

    @Transactional
    public AssessmentResponse updateAssessment(UUID courseId, AssessmentRequest request) {
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));
        
        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setPassingPercentage(request.getPassingPercentage());
        assessment.setMaxAttempts(request.getMaxAttempts());
        if (request.getActive() != null) {
            assessment.setActive(request.getActive());
        }

        // Updating questions is omitted for brevity, normally we sync the list.
        
        return mapToResponse(assessmentRepository.save(assessment));
    }

    @Transactional
    public void deleteAssessment(UUID courseId) {
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));

        attemptRepository.deleteByAssessmentId(assessment.getId());
        assessmentRepository.deleteById(assessment.getId());
    }

    @Transactional
    public void resetAttempts(UUID assessmentId, UUID studentId) {
        List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(assessmentId, studentId);
        attemptRepository.deleteAll(attempts);
    }

    // --- Student Endpoints ---

    @Transactional(readOnly = true)
    public AssessmentResponse getAssessmentByCourseId(UUID courseId) {
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));
        return mapToResponse(assessment);
    }

    @Transactional(readOnly = true)
    public List<AssessmentQuestionResponse> getQuestionsForStudent(UUID courseId) {
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));

        if (!assessment.getActive()) {
            throw new EgramException("Assessment is not active", HttpStatus.BAD_REQUEST);
        }
        
        return questionRepository.findByAssessmentId(assessment.getId()).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultResponse submitAssessment(UUID courseId, AssessmentSubmissionRequest request) {
        User student = getCurrentUser();
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));

        if (!assessment.getActive()) {
            throw new EgramException("Assessment is not active", HttpStatus.BAD_REQUEST);
        }

        CertificateEligibilityResponse eligibility = courseService.getCertificateEligibility(assessment.getCourse().getId());
        if (!eligibility.getEligible()) {
            throw new EgramException("You must complete all topics before taking the final assessment.", HttpStatus.BAD_REQUEST);
        }

        List<AssessmentAttempt> previousAttempts = attemptRepository.findByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(assessment.getId(), student.getId());
        int attemptCount = previousAttempts.size();
        
        boolean alreadyPassed = previousAttempts.stream().anyMatch(AssessmentAttempt::getPassed);
        if (alreadyPassed) {
            throw new EgramException("You have already passed this assessment", HttpStatus.BAD_REQUEST);
        }

        if (attemptCount >= assessment.getMaxAttempts()) {
            throw new EgramException("You have exceeded the maximum number of attempts", HttpStatus.BAD_REQUEST);
        }

        List<AssessmentQuestion> questions = questionRepository.findByAssessmentId(assessment.getId());
        int totalQuestions = questions.size();
        
        if (totalQuestions == 0) {
            throw new EgramException("Assessment has no questions", HttpStatus.BAD_REQUEST);
        }

        int score = 0;
        for (AssessmentQuestion q : questions) {
            String studentAnswer = request.getAnswers().get(q.getId());
            if (studentAnswer != null && studentAnswer.equals(q.getCorrectAnswer())) {
                score++;
            }
        }

        int percentage = (int) Math.round((score * 100.0) / totalQuestions);
        boolean passed = percentage >= assessment.getPassingPercentage();

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .student(student)
                .assessment(assessment)
                .score(score)
                .percentage(percentage)
                .passed(passed)
                .totalQuestions(totalQuestions)
                .correctAnswers(score)
                .wrongAnswers(totalQuestions - score)
                .attemptNumber(attemptCount + 1)
                .submittedAt(LocalDateTime.now())
                .build();

        attempt = attemptRepository.save(attempt);

        if (passed) {
            certificateService.autoGenerateCertificate(student, assessment.getCourse());
        }

        return AssessmentResultResponse.builder()
                .assessmentId(assessment.getId())
                .totalQuestions(totalQuestions)
                .score(score)
                .percentage(percentage)
                .passed(passed)
                .message(passed ? "Congratulations! You passed the assessment." : "You did not pass. Please try again.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AssessmentAttemptResponse> getMyAttempts(UUID courseId) {
        User student = getCurrentUser();
        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new EgramException("Assessment not found for course", HttpStatus.NOT_FOUND));

        return attemptRepository.findByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(assessment.getId(), student.getId())
                .stream()
                .map(this::mapToAttemptResponse)
                .collect(Collectors.toList());
    }

    // --- Mappers ---

    private AssessmentResponse mapToResponse(Assessment assessment) {
        return AssessmentResponse.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .description(assessment.getDescription())
                .durationMinutes(assessment.getDurationMinutes())
                .passingPercentage(assessment.getPassingPercentage())
                .maxAttempts(assessment.getMaxAttempts())
                .active(assessment.getActive())
                .courseId(assessment.getCourse() != null ? assessment.getCourse().getId() : null)
                .courseTitle(assessment.getCourse() != null ? assessment.getCourse().getTitle() : null)
                .questions(assessment.getQuestions() != null ? 
                    assessment.getQuestions().stream().map(this::mapToQuestionResponseForAdmin).collect(Collectors.toList()) 
                    : List.of())
                .build();
    }

    private AssessmentQuestionResponse mapToQuestionResponse(AssessmentQuestion q) {
        return AssessmentQuestionResponse.builder()
                .id(q.getId())
                .question(q.getQuestion())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .build();
    }

    private AssessmentQuestionResponse mapToQuestionResponseForAdmin(AssessmentQuestion q) {
        return mapToQuestionResponse(q);
    }

    private AssessmentAttemptResponse mapToAttemptResponse(AssessmentAttempt attempt) {
        return AssessmentAttemptResponse.builder()
                .id(attempt.getId())
                .assessmentId(attempt.getAssessment().getId())
                .studentName(attempt.getStudent().getFullName())
                .score(attempt.getScore())
                .totalQuestions(attempt.getTotalQuestions())
                .correctAnswers(attempt.getCorrectAnswers())
                .wrongAnswers(attempt.getWrongAnswers())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .attemptNumber(attempt.getAttemptNumber())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }
}
