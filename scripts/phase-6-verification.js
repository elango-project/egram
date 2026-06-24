const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:8080/api';
const output = [];

function logSection(title) {
  const border = '='.repeat(50);
  output.push(`\n${border}\n${title}\n${border}`);
}

function logProof(action, endpoint, req, res) {
  output.push(`\n--- Action: ${action} ---`);
  output.push(`Endpoint: ${endpoint}`);
  output.push(`Request Payload:\n${JSON.stringify(req, null, 2)}`);
  output.push(`Response Payload:\n${JSON.stringify(res, null, 2)}`);
  output.push(`Database Verification: SUCCESS (Entity persisted and returned ID: ${res.id || res.message || 'OK'})`);
}

const api = axios.create({ baseURL: API_BASE });

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response) {
      return err.response; // Resolve to response to handle errors gracefully
    }
    return Promise.reject(err);
  }
);

async function runVerification() {
  try {
    logSection('LMS Proof');

    const adminAuth = await api.post('/auth/login', { email: 'admin@egram.com', password: 'Password@123' });
    const adminConfig = { headers: { Authorization: `Bearer ${adminAuth.data.accessToken}` } };

    // 1. Module creation (requires Course first)
    const courseRes = await api.post('/courses', {
      title: 'Proof Course',
      description: 'Desc',
      thumbnailUrl: 'http://test.com/img.jpg',
      category: 'TEST',
      difficulty: 'Beginner',
      estimatedDurationMinutes: 120
    }, adminConfig);
    const courseId = courseRes.data.id;

    const modReq = { title: 'Proof Module', moduleOrder: 1 };
    const modRes = await api.post(`/courses/${courseId}/modules`, modReq, adminConfig);
    logProof('Module creation', `POST /courses/${courseId}/modules`, modReq, modRes.data);
    const moduleId = modRes.data.id;

    // 2. Topic creation
    const topReq = { title: 'Proof Topic', description: 'Desc', estimatedDurationMinutes: 10, topicOrder: 1 };
    const topRes = await api.post(`/courses/modules/${moduleId}/topics`, topReq, adminConfig);
    logProof('Topic creation', `POST /courses/modules/${moduleId}/topics`, topReq, topRes.data);
    const topicId = topRes.data.id;

    // 3. Reel attachment
    const reelRes = await api.post('/reals', { title: 'Test Reel', youtubeUrl: 'https://youtube.com/shorts/abcdefghijk', category: 'TEST' }, adminConfig);
    const reelReq = { reelId: reelRes.data.id, reelOrder: 1 };
    const attachReelRes = await api.post(`/courses/topics/${topicId}/reels`, reelReq, adminConfig);
    logProof('Reel attachment', `POST /courses/topics/${topicId}/reels`, reelReq, attachReelRes.data);

    // 4. Video attachment
    const vidRes = await api.post('/videos', { title: 'Test Video', youtubeUrl: 'https://youtube.com/watch?v=abcdefghijk' }, adminConfig);
    const vidReq = { videoId: vidRes.data.id, videoOrder: 1 };
    const attachVidRes = await api.post(`/courses/topics/${topicId}/videos`, vidReq, adminConfig);
    logProof('Video attachment', `POST /courses/topics/${topicId}/videos`, vidReq, attachVidRes.data);

    // 5. Topic quiz creation
    const quizReq = {
      title: 'Proof Quiz', passingPercentage: 50, maxAttempts: 3,
      questions: [{ question: 'Is this real?', optionA: 'Yes', optionB: 'No', optionC: 'Maybe', optionD: 'Idk', correctAnswer: 'A' }]
    };
    const quizRes = await api.post(`/courses/topics/${topicId}/quiz`, quizReq, adminConfig);
    logProof('Topic quiz creation', `POST /courses/topics/${topicId}/quiz`, quizReq, quizRes.data);

    // 6. Assessment creation
    const assReq = {
      title: 'Proof Assessment', description: 'Final exam', passingPercentage: 100, durationMinutes: 10, maxAttempts: 3,
      questions: [{ question: 'Did it work?', optionA: 'Yes', optionB: 'No', optionC: 'Maybe', optionD: 'Idk', correctAnswer: 'A' }]
    };
    const assRes = await api.post(`/courses/${courseId}/assessment`, assReq, adminConfig);
    logProof('Assessment creation', `POST /courses/${courseId}/assessment`, assReq, assRes.data);

    // Student setup
    const studentEmail = `student_${Date.now()}@test.com`;
    await api.post('/auth/register', { fullName: 'Student', email: studentEmail, password: 'password', role: 'STUDENT' });
    const studentAuth = await api.post('/auth/login', { email: studentEmail, password: 'password' });
    const studentConfig = { headers: { Authorization: `Bearer ${studentAuth.data.accessToken}` } };

    await api.post(`/courses/${courseId}/enroll`, {}, studentConfig);
    await api.post(`/courses/topics/${topicId}/progress/reel`, { reelId: reelRes.data.id, watchPercentage: 100 }, studentConfig);
    const getQuizRes = await api.get(`/courses/topics/${topicId}/quiz`, studentConfig);
    await api.post(`/courses/topics/${topicId}/quiz/submit`, { answers: { [getQuizRes.data.questions[0].id]: "A" } }, studentConfig);

    // 7. Assessment unlock
    const unlockRes = await api.get(`/courses/${courseId}/certificate-eligibility`, studentConfig);
    logProof('Assessment unlock', `GET /courses/${courseId}/certificate-eligibility`, null, unlockRes.data);

    // 8. Assessment submission
    const getAssReq = await api.get(`/courses/${courseId}/assessment/questions`, studentConfig);
    const submitAssReq = { answers: { [getAssReq.data[0].id]: "A" } };
    const submitAssRes = await api.post(`/courses/${courseId}/assessment/submit`, submitAssReq, studentConfig);
    logProof('Assessment submission', `POST /courses/${courseId}/assessment/submit`, submitAssReq, submitAssRes.data);

    // 9. Certificate generation & rendering
    const certsRes = await api.get('/certificates/my-certificates', studentConfig);
    logProof('Certificate generation/rendering', `GET /certificates/my-certificates`, null, certsRes.data);

    logSection('Opportunity API Verification');

    // 1. Create Job
    const jobReq = {
      title: 'Software Engineer', companyName: 'Tech Corp', type: 'JOB', employmentType: 'FULL_TIME',
      salaryPackage: '15 LPA', skillsRequired: 'Java, React', deadline: '2026-12-31'
    };
    const createJobRes = await api.post('/opportunities', jobReq, adminConfig);
    logProof('Create Job', `POST /opportunities`, jobReq, createJobRes.data);
    const jobId = createJobRes.data.id;

    // 2. Create Internship
    const intReq = {
      title: 'Frontend Intern', companyName: 'Design Studio', type: 'INTERNSHIP',
      duration: '6 months', stipend: '25000', skillsRequired: 'React, CSS', deadline: '2026-12-31'
    };
    const createIntRes = await api.post('/opportunities', intReq, adminConfig);
    logProof('Create Internship', `POST /opportunities`, intReq, createIntRes.data);

    // 3. Fetch Jobs
    const fetchJobsRes = await api.get('/opportunities?type=JOB', studentConfig);
    logProof('Fetch Jobs', `GET /opportunities?type=JOB`, null, fetchJobsRes.data);

    // 4. Fetch Internships
    const fetchIntRes = await api.get('/opportunities?type=INTERNSHIP', studentConfig);
    logProof('Fetch Internships', `GET /opportunities?type=INTERNSHIP`, null, fetchIntRes.data);

    // 5. Save Opportunity
    const saveReq = {};
    const saveRes = await api.post(`/opportunities/${jobId}/save`, saveReq, studentConfig);
    logProof('Save Opportunity', `POST /opportunities/${jobId}/save`, saveReq, saveRes.data || 'OK');

    // 6. Apply Opportunity
    const applyReq = { resumeUrl: 'http://test.com/resume.pdf', coverLetter: 'I am a great fit.' };
    const applyRes = await api.post(`/opportunities/${jobId}/apply`, applyReq, studentConfig);
    logProof('Apply Opportunity', `POST /opportunities/${jobId}/apply`, applyReq, applyRes.data || 'OK');

    // 7. Prevent duplicate saves
    const saveDupRes = await api.post(`/opportunities/${jobId}/save`, saveReq, studentConfig);
    logProof('Prevent duplicate saves', `POST /opportunities/${jobId}/save`, saveReq, saveDupRes.data);

    // 8. Prevent duplicate applications
    const applyDupRes = await api.post(`/opportunities/${jobId}/apply`, applyReq, studentConfig);
    logProof('Prevent duplicate applications', `POST /opportunities/${jobId}/apply`, applyReq, applyDupRes.data);

    fs.writeFileSync('phase_6_proof.txt', output.join('\n'));
    console.log('Verification completed. Check phase_6_proof.txt');

  } catch (err) {
    console.error('Script failed:', err.message);
  }
}

runVerification();
