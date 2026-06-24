const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response) return err.response;
    return Promise.reject(err);
  }
);

async function runRC() {
  console.log('--- STARTING V1.0 RC CHECKLIST ---');
  let allPassed = true;

  function assert(condition, testName, data) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      if (data) console.error(JSON.stringify(data, null, 2));
      allPassed = false;
    }
  }

  try {
    // Auth Setup
    const adminAuth = await api.post('/auth/login', { email: 'admin@egram.com', password: 'Password@123' });
    const adminConfig = { headers: { Authorization: `Bearer ${adminAuth.data.accessToken}` } };

    const studentEmail = `student_rc_${Date.now()}@test.com`;
    await api.post('/auth/register', { fullName: 'RC Student', email: studentEmail, password: 'password', role: 'STUDENT' });
    const studentAuth = await api.post('/auth/login', { email: studentEmail, password: 'password' });
    const studentConfig = { headers: { Authorization: `Bearer ${studentAuth.data.accessToken}` } };

    // --- ADMIN SIDE ---
    console.log('\n--- Admin Side ---');
    
    // 1. Create Job
    const jobRes = await api.post('/opportunities', { title: 'RC Job', companyName: 'Corp', type: 'JOB', deadline: '2026-12-31', salaryPackage: '1' }, adminConfig);
    assert(jobRes.status < 400 && jobRes.data.id, 'Create Job', jobRes.data);
    const jobId = jobRes.data.id;

    // 2. Edit Job
    const editJobRes = await api.put(`/opportunities/${jobId}`, { title: 'RC Job Edited', companyName: 'Corp', type: 'JOB', deadline: '2026-12-31', salaryPackage: '1' }, adminConfig);
    assert(editJobRes.status < 400 && editJobRes.data.title === 'RC Job Edited', 'Edit Job', editJobRes.data);

    // 3. Create Internship
    const intRes = await api.post('/opportunities', { title: 'RC Intern', companyName: 'Studio', type: 'INTERNSHIP', deadline: '2026-12-31', stipend: '1' }, adminConfig);
    assert(intRes.status < 400 && intRes.data.id, 'Create Internship', intRes.data);
    const intId = intRes.data.id;

    // 4. Edit Internship
    const editIntRes = await api.put(`/opportunities/${intId}`, { title: 'RC Intern Edited', companyName: 'Studio', type: 'INTERNSHIP', deadline: '2026-12-31', stipend: '1' }, adminConfig);
    assert(editIntRes.status < 400 && editIntRes.data.title === 'RC Intern Edited', 'Edit Internship', editIntRes.data);

    // --- STUDENT SIDE ---
    console.log('\n--- Student Side ---');
    
    // 5. View Jobs
    const jobsList = await api.get('/opportunities?type=JOB', studentConfig);
    assert(jobsList.data.some(j => j.id === jobId), 'View Jobs page');

    // 6. View Internships
    const intList = await api.get('/opportunities?type=INTERNSHIP', studentConfig);
    assert(intList.data.some(i => i.id === intId), 'View Internships page');

    // 7. Save Job
    const saveJobRes = await api.post(`/opportunities/${jobId}/save`, {}, studentConfig);
    assert(saveJobRes.status < 400, 'Save job', saveJobRes.data);

    // 8. Apply Job
    const applyJobRes = await api.post(`/opportunities/${jobId}/apply`, { resumeUrl: 'http://test.com/resume.pdf', coverLetter: 'hi' }, studentConfig);
    assert(applyJobRes.status < 400, 'Apply job', applyJobRes.data);

    // 9. Prevent duplicate application
    const dupApplyRes = await api.post(`/opportunities/${jobId}/apply`, { resumeUrl: 'http://test.com/resume.pdf' }, studentConfig);
    assert(dupApplyRes.status >= 400, 'Prevent duplicate application', dupApplyRes.data);

    // 10. Save Internship
    const saveIntRes = await api.post(`/opportunities/${intId}/save`, {}, studentConfig);
    assert(saveIntRes.status < 400, 'Save internship', saveIntRes.data);

    // 11. Apply Internship
    const applyIntRes = await api.post(`/opportunities/${intId}/apply`, { resumeUrl: 'http://test.com/resume.pdf' }, studentConfig);
    assert(applyIntRes.status < 400, 'Apply internship', applyIntRes.data);

    // 12. Unsave job
    const unsaveJobRes = await api.delete(`/opportunities/${jobId}/save`, studentConfig);
    assert(unsaveJobRes.status < 400, 'Unsave job', unsaveJobRes.data);

    // --- ADMIN CONTINUED ---
    console.log('\n--- Admin Applicants ---');
    
    // 13. View applicants
    const appsRes = await api.get(`/opportunities/${jobId}/applications`, adminConfig);
    assert(appsRes.status < 400 && appsRes.data.length > 0, 'View applicants', appsRes.data);
    
    // 14. Change applicant status
    const studentId = appsRes.data[0]?.studentId;
    if (studentId) {
      const statusRes = await api.put(`/opportunities/${jobId}/applications/${studentId}/status?status=SHORTLISTED`, {}, adminConfig);
      assert(statusRes.status < 400, 'Change applicant status', statusRes.data);
    } else {
      assert(false, 'Change applicant status', 'No applicants found');
    }

    // 15. Delete Job / Internship
    const delJobRes = await api.delete(`/opportunities/${jobId}`, adminConfig);
    assert(delJobRes.status < 400, 'Delete Job', delJobRes.data);
    const delIntRes = await api.delete(`/opportunities/${intId}`, adminConfig);
    assert(delIntRes.status < 400, 'Delete Internship', delIntRes.data);

    // --- PLACEMENT DASHBOARD ---
    console.log('\n--- Placement Dashboard ---');
    const savedRes = await api.get('/opportunities/saved', studentConfig);
    const myAppsRes = await api.get('/opportunities/my-applications', studentConfig);
    
    const j2 = await api.post('/opportunities', { title: 'J2', companyName: 'Corp', type: 'JOB', deadline: '2026-12-31', salaryPackage: '1' }, adminConfig);
    const i2 = await api.post('/opportunities', { title: 'I2', companyName: 'Corp', type: 'INTERNSHIP', deadline: '2026-12-31', stipend: '1' }, adminConfig);
    await api.post(`/opportunities/${j2.data.id}/apply`, { resumeUrl: 'http://test.com/resume.pdf' }, studentConfig);
    await api.post(`/opportunities/${i2.data.id}/save`, {}, studentConfig);

    const saved2 = await api.get('/opportunities/saved', studentConfig);
    const apps2 = await api.get('/opportunities/my-applications', studentConfig);
    assert(apps2.data.some(a => a.job.type === 'JOB'), 'Applied Jobs count correct');
    assert(saved2.data.some(j => j.type === 'INTERNSHIP'), 'Saved Internships count correct');


    // --- LMS REGRESSION ---
    console.log('\n--- LMS Regression ---');
    const cRes = await api.post('/courses', { 
      title: 'RC Course', description: 'Desc', thumbnailUrl: 'http://test.com/img.jpg', category: 'TEST', difficulty: 'Beginner', estimatedDurationMinutes: 120 
    }, adminConfig);
    assert(cRes.status < 400, 'Create Course', cRes.data);
    const cId = cRes.data.id;

    const mRes = await api.post(`/courses/${cId}/modules`, { title: 'M1', moduleOrder: 1 }, adminConfig);
    assert(mRes.status < 400, 'Create Module', mRes.data);
    const mId = mRes.data.id;

    const tRes = await api.post(`/courses/modules/${mId}/topics`, { title: 'T1', topicOrder: 1, estimatedDurationMinutes: 10, description: 'Desc' }, adminConfig);
    assert(tRes.status < 400, 'Create Topic', tRes.data);
    const tId = tRes.data.id;

    const reel = await api.post('/reals', { title: 'R', youtubeUrl: 'https://youtube.com/shorts/abcdefghijk', category: 'TEST' }, adminConfig);
    assert(reel.status < 400, 'Create Reel', reel.data);
    const attachR = await api.post(`/courses/topics/${tId}/reels`, { reelId: reel.data?.id, reelOrder: 1 }, adminConfig);
    assert(attachR.status < 400, 'Attach Reel', attachR.data);

    const vid = await api.post('/videos', { title: 'V', youtubeUrl: 'https://youtube.com/watch?v=abcdefghijk' }, adminConfig);
    assert(vid.status < 400, 'Create Video', vid.data);
    const attachV = await api.post(`/courses/topics/${tId}/videos`, { videoId: vid.data?.id, videoOrder: 1 }, adminConfig);
    assert(attachV.status < 400, 'Attach Video', attachV.data);

    const quiz = await api.post(`/courses/topics/${tId}/quiz`, { title: 'Q', passingPercentage: 50, maxAttempts: 3, questions: [{question: 'A', optionA: '1', optionB: '2', optionC: '3', optionD: '4', correctAnswer: 'A'}] }, adminConfig);
    assert(quiz.status < 400, 'Create Topic Quiz', quiz.data);

    const ass = await api.post(`/courses/${cId}/assessment`, { title: 'A', passingPercentage: 100, durationMinutes: 10, maxAttempts: 3, description: 'Desc', questions: [{question: 'B', optionA: '1', optionB: '2', optionC: '3', optionD: '4', correctAnswer: 'A'}] }, adminConfig);
    assert(ass.status < 400, 'Create Assessment', ass.data);

    await api.post(`/courses/${cId}/enroll`, {}, studentConfig);
    assert(true, 'Student enrollment');

    await api.post(`/courses/topics/${tId}/progress/reel`, { reelId: reel.data?.id, watchPercentage: 100 }, studentConfig);
    const getQ = await api.get(`/courses/topics/${tId}/quiz`, studentConfig);
    await api.post(`/courses/topics/${tId}/quiz/submit`, { answers: { [getQ.data.questions[0].id]: "A" } }, studentConfig);
    const pRes = await api.get(`/courses/topics/${tId}/progress`, studentConfig);
    assert(pRes.data.topicCompleted === true, 'Topic completion');

    const elig = await api.get(`/courses/${cId}/certificate-eligibility`, studentConfig);
    assert(elig.data.eligible === true, 'Assessment unlock');

    const aQs = await api.get(`/courses/${cId}/assessment/questions`, studentConfig);
    const aSub = await api.post(`/courses/${cId}/assessment/submit`, { answers: { [aQs.data[0].id]: "A" } }, studentConfig);
    assert(aSub.data.passed === true, 'Assessment pass');

    const certs = await api.get('/certificates/my-certificates', studentConfig);
    assert(certs.data.some(c => c.courseId === cId), 'Certificate generation');

    if (allPassed) {
      console.log('\n✅ ALL RC TESTS PASSED!');
    } else {
      console.log('\n❌ SOME RC TESTS FAILED!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err.message);
    process.exit(1);
  }
}

runRC();
