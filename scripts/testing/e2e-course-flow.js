const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

const state = {
  adminToken: '',
  studentToken: '',
  adminId: '',
  studentId: '',
  courseId: '',
  moduleId: '',
  topicId: '',
  reelId: '',
  videoId: '',
  assessmentId: '',
  certificateId: ''
};

// Utilities
const api = axios.create({ baseURL: API_BASE });
api.interceptors.response.use(
  res => res,
  err => {
    console.error(`\n[API Error] ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
    return Promise.reject(err);
  }
);

function assert(condition, message) {
  if (!condition) {
    console.error(`\nFAIL: ${message}`);
    process.exit(1);
  }
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function runTest() {
  try {
    const studentEmail = `student_${Date.now()}@test.com`;

    // 1. Admin Login (Using pre-seeded admin)
    const adminEmail = 'admin@egram.com';
    const adminAuth = await api.post('/auth/login', {
      email: adminEmail,
      password: 'Password@123'
    });
    state.adminToken = adminAuth.data.accessToken;
    const adminConfig = { headers: { Authorization: `Bearer ${state.adminToken}` } };
    pass('Admin Login');

    // 2. Create Course
    const courseRes = await api.post('/courses', {
      title: 'E2E Test Course',
      description: 'Test description',
      thumbnailUrl: 'http://test.com/img.jpg',
      category: 'TEST',
      difficulty: 'Beginner',
      estimatedDurationMinutes: 120
    }, adminConfig);
    state.courseId = courseRes.data.id;
    pass('Create Course');

    // 3. Create Module
    const modRes = await api.post(`/courses/${state.courseId}/modules`, {
      title: 'E2E Test Module',
      moduleOrder: 1
    }, adminConfig);
    state.moduleId = modRes.data.id;
    pass('Create Module');

    // 4. Create Topic
    const topRes = await api.post(`/courses/modules/${state.moduleId}/topics`, {
      title: 'E2E Test Topic',
      description: 'Test Topic Desc',
      estimatedDurationMinutes: 10,
      topicOrder: 1
    }, adminConfig);
    state.topicId = topRes.data.id;
    pass('Create Topic');

    // 5. Create Reel
    const reelRes = await api.post('/reals', {
      title: 'Test Reel',
      youtubeUrl: 'https://youtube.com/shorts/abcdefghijk',
      category: 'TEST'
    }, adminConfig);
    state.reelId = reelRes.data.id;
    pass('Create Reel');

    // 6. Create Video
    const vidRes = await api.post('/videos', {
      title: 'Test Video',
      youtubeUrl: 'https://youtube.com/watch?v=abcdefghijk'
    }, adminConfig);
    state.videoId = vidRes.data.id;
    pass('Create Video');

    // 7. Attach Reel
    await api.post(`/courses/topics/${state.topicId}/reels`, {
      reelId: state.reelId,
      reelOrder: 1
    }, adminConfig);
    pass('Attach Reel');

    // 8. Attach Video
    await api.post(`/courses/topics/${state.topicId}/videos`, {
      videoId: state.videoId,
      videoOrder: 1
    }, adminConfig);
    pass('Attach Video');

    // 9. Create Topic Quiz
    await api.post(`/courses/topics/${state.topicId}/quiz`, {
      title: 'Test Topic Quiz',
      passingPercentage: 50,
      maxAttempts: 3,
      questions: [
        {
          question: 'Is this an E2E test?',
          optionA: 'Yes',
          optionB: 'No',
          optionC: 'Maybe',
          optionD: 'I do not know',
          correctAnswer: 'A',
          explanation: 'Yes it is.'
        }
      ]
    }, adminConfig);
    pass('Create Topic Quiz');

    // 10. Create Assessment
    await api.post(`/courses/${state.courseId}/assessment`, {
      title: 'Test Assessment',
      description: 'Final exam',
      passingPercentage: 100,
      durationMinutes: 10,
      maxAttempts: 3,
      questions: [
        {
          question: 'Did the assessment work?',
          optionA: 'Yes',
          optionB: 'No',
          optionC: 'Maybe',
          optionD: 'I do not know',
          correctAnswer: 'A'
        }
      ]
    }, adminConfig);
    pass('Create Assessment');

    // ----------------------------------------------------
    // STUDENT FLOW
    // ----------------------------------------------------

    // 11. Student Register & Login
    await api.post('/auth/register', {
      fullName: 'Student Test',
      email: studentEmail,
      password: 'password123',
      role: 'STUDENT'
    });
    const studentAuth = await api.post('/auth/login', {
      email: studentEmail,
      password: 'password123'
    });
    state.studentToken = studentAuth.data.accessToken;
    const studentConfig = { headers: { Authorization: `Bearer ${state.studentToken}` } };
    pass('Student Login');

    // 12. Enroll in Course
    await api.post(`/courses/${state.courseId}/enroll`, {}, studentConfig);
    pass('Enroll Course');

    // 13. Mark Reel Complete
    await api.post(`/courses/topics/${state.topicId}/progress/reel`, {
      reelId: state.reelId,
      watchPercentage: 100
    }, studentConfig);
    pass('Mark Reel Complete');

    // 14. Verify Topic NOT completed (requires Quiz)
    const topicProgressRes1 = await api.get(`/courses/topics/${state.topicId}/progress`, studentConfig);
    assert(topicProgressRes1.data.topicCompleted === false, 'Topic should not be completed without quiz');
    pass('Verify Topic NOT completed');

    // 15. Submit Topic Quiz
    const quizRes = await api.get(`/courses/topics/${state.topicId}/quiz`, studentConfig);
    const quizId = quizRes.data.id;
    const questionId = quizRes.data.questions[0].id;
    
    await api.post(`/courses/topics/${state.topicId}/quiz/submit`, {
      answers: { [questionId]: "A" }
    }, studentConfig);
    pass('Submit Topic Quiz');

    // 16. Verify Topic completed
    const topicProgressRes2 = await api.get(`/courses/topics/${state.topicId}/progress`, studentConfig);
    assert(topicProgressRes2.data.topicCompleted === true, 'Topic should be completed after quiz');
    pass('Verify Topic completed');

    // 17. Verify Course completed (since all topics are completed)
    const courseRes2 = await api.get(`/courses/${state.courseId}`, studentConfig);
    console.log(`Course Progress: ${courseRes2.data.progressPercentage}%`);
    assert(courseRes2.data.progressPercentage === 100, 'Course should be completed (100%)');
    pass('Verify Course completed');

    // 18. Verify Assessment Unlocked
    const assessEligibilityRes = await api.get(`/courses/${state.courseId}/certificate-eligibility`, studentConfig);
    assert(assessEligibilityRes.data.eligible === true, 'Student should be eligible for assessment');
    pass('Verify Assessment Unlocked');

    // 19. Submit Assessment
    const assessQuestionsRes = await api.get(`/courses/${state.courseId}/assessment/questions`, studentConfig);
    const aQuestionId = assessQuestionsRes.data[0].id;

    const attemptRes = await api.post(`/courses/${state.courseId}/assessment/submit`, {
      answers: { [aQuestionId]: "B" } // Wrong answer
    }, studentConfig);
    assert(attemptRes.data.passed === false, 'Assessment should be failed');
    pass('Submit Assessment (Failed Attempt)');

    // 19.5. Student Retake Assessment
    const retakeRes = await api.post(`/courses/${state.courseId}/assessment/submit`, {
      answers: { [aQuestionId]: "A" } // Correct answer
    }, studentConfig);
    console.log('Retake Response:', retakeRes.data);
    assert(retakeRes.data.passed === true, 'Retake should pass');
    pass('Student Retake Assessment');

    // 20. Verify Certificate generated
    const certsRes = await api.get('/certificates/my-certificates', studentConfig);
    const hasCert = certsRes.data.some(c => c.courseId === state.courseId);
    assert(hasCert === true, 'Certificate should exist for course');
    pass('Verify Certificate generated');

    console.log('\nALL TESTS PASSED');
    
  } catch (error) {
    console.error('\nTEST EXECUTION FAILED');
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

runTest();
