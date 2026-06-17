/**
 * test_release.js — Phase 12D: Comprehensive QA Test Suite for Egram v1.1.0
 * 
 * Tests:
 *   1. Authentication (login, register, invalid creds, missing JWT, invalid JWT, role access)
 *   2. Course Enrollment & Progress
 *   3. Assessment Submission & Attempt History
 *   4. Video Progress Tracking
 *   5. Job Application Lifecycle
 *   6. Reals Engagement (like, comment, view)
 *   7. API Validation (empty payloads, invalid UUIDs)
 *   8. Database Integrity (cascade deletes, duplicate prevention)
 */

const http = require('http');

const PORT = 8080;
const HOST = '127.0.0.1';

let adminToken = '';
let studentToken = '';
const results = { passed: 0, failed: 0, details: [] };

// --- Utility ---
const request = (method, path, token, body, expectFail = false) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST, port: PORT, path: `/api${path}`, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { parsed = data; }
        if (expectFail) {
          resolve({ status: res.statusCode, data: parsed });
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else {
          reject(new Error(`${method} ${path} -> ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', e => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const pass = (name) => { results.passed++; results.details.push({ name, status: 'PASS' }); console.log(`  ✅ ${name}`); };
const fail = (name, reason) => { results.failed++; results.details.push({ name, status: 'FAIL', reason }); console.log(`  ❌ ${name}: ${reason}`); };

const test = async (name, fn) => {
  try { await fn(); pass(name); }
  catch (e) { fail(name, e.message || String(e)); }
};

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

// ============================================================
// TEST SUITES
// ============================================================

async function testAuthentication() {
  console.log('\n--- 1. AUTHENTICATION ---');

  await test('Admin login succeeds', async () => {
    const res = await request('POST', '/auth/login', null, { email: 'admin@egram.com', password: 'Password@123' });
    assert(res.data.accessToken, 'No accessToken returned');
    adminToken = res.data.accessToken;
  });

  const uniqueEmail = `qa_student_${Date.now()}@test.com`;
  await test('Student registration succeeds', async () => {
    await request('POST', '/auth/register', null, { fullName: 'QA Student', email: uniqueEmail, password: 'Password@123', role: 'STUDENT' });
  });

  await test('Student login succeeds', async () => {
    const res = await request('POST', '/auth/login', null, { email: uniqueEmail, password: 'Password@123' });
    assert(res.data.accessToken, 'No accessToken returned');
    studentToken = res.data.accessToken;
  });

  await test('Invalid credentials returns error', async () => {
    const res = await request('POST', '/auth/login', null, { email: 'wrong@example.com', password: 'wrong' }, true);
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  });

  await test('Missing JWT returns 401 on protected endpoint', async () => {
    const res = await request('GET', '/courses', null, null, true);
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
  });

  await test('Invalid JWT returns 401 on protected endpoint', async () => {
    const res = await request('GET', '/courses', 'invalid.jwt.token', null, true);
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
  });

  await test('Student cannot access admin endpoint (POST /courses)', async () => {
    const res = await request('POST', '/courses', studentToken, { title: 'Hack', description: 'x' }, true);
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('Student cannot create job', async () => {
    const res = await request('POST', '/jobs', studentToken, { title: 'Hack', companyName: 'x', type: 'JOB' }, true);
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('Duplicate registration fails', async () => {
    const res = await request('POST', '/auth/register', null, { fullName: 'QA Student', email: uniqueEmail, password: 'Password@123', role: 'STUDENT' }, true);
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  });
}

async function testAPIValidation() {
  console.log('\n--- 2. API VALIDATION ---');

  await test('Empty body on login returns validation error', async () => {
    const res = await request('POST', '/auth/login', null, {}, true);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Invalid UUID on course returns error', async () => {
    const res = await request('GET', '/courses/not-a-uuid', adminToken, null, true);
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  });

  await test('Non-existent course returns 404', async () => {
    const res = await request('GET', '/courses/00000000-0000-0000-0000-000000000000', adminToken, null, true);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await test('Missing required fields on job creation returns 400', async () => {
    const res = await request('POST', '/jobs', adminToken, { description: 'test only' }, true);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Non-existent job returns 404', async () => {
    const res = await request('GET', '/jobs/00000000-0000-0000-0000-000000000000', adminToken, null, true);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });
}

async function testCourseLifecycle() {
  console.log('\n--- 3. COURSE LIFECYCLE ---');
  let courseId;

  await test('Admin creates course', async () => {
    const res = await request('POST', '/courses', adminToken, {
      title: 'QA Test Course', description: 'For testing', category: 'Testing',
      difficulty: 'BEGINNER', duration: '2 hours', thumbnailUrl: 'https://example.com/thumb.jpg'
    });
    courseId = res.data.id;
    assert(courseId, 'No course ID returned');
  });

  await test('Student enrolls in course', async () => {
    await request('POST', `/courses/${courseId}/enroll`, studentToken);
  });

  await test('Student views course with progress', async () => {
    const res = await request('GET', `/courses/${courseId}`, studentToken);
    assert(res.data.progressPercentage !== undefined, 'progressPercentage field missing');
    assert(!isNaN(res.data.progressPercentage), `progressPercentage is NaN: ${res.data.progressPercentage}`);
  });

  await test('Duplicate enrollment fails', async () => {
    const res = await request('POST', `/courses/${courseId}/enroll`, studentToken, null, true);
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  });

  await test('Admin deletes course (cascade)', async () => {
    await request('DELETE', `/courses/${courseId}`, adminToken);
  });

  await test('Deleted course returns 404', async () => {
    const res = await request('GET', `/courses/${courseId}`, studentToken, null, true);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });
}

async function testAssessmentLifecycle() {
  console.log('\n--- 4. ASSESSMENT LIFECYCLE ---');
  let assessmentId;

  await test('Admin creates assessment with questions', async () => {
    const res = await request('POST', '/assessments', adminToken, {
      title: 'QA Assessment', description: 'Testing',
      passingPercentage: 50, durationMinutes: 30
    });
    assessmentId = res.data.id;
    assert(assessmentId, 'No assessment ID returned');

    await request('POST', `/assessments/${assessmentId}/questions`, adminToken, { 
      question: 'What is 2+2?', optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctAnswer: 'B' 
    });
    await request('POST', `/assessments/${assessmentId}/questions`, adminToken, { 
      question: 'What is Java?', optionA: 'Drink', optionB: 'Language', optionC: 'Island', optionD: 'All', correctAnswer: 'D' 
    });
    assert(assessmentId, 'No assessment ID returned');
  });

  await test('Student views attempt history', async () => {
    // First submit an attempt
    const getRes = await request('GET', `/assessments/${assessmentId}/questions`, studentToken);
    const questions = getRes.data;
    assert(questions && questions.length > 0, `No questions found. Response: ${JSON.stringify(getRes.data)}`);
    
    const answers = {};
    answers[questions[0].id] = 'B';
    answers[questions[1].id] = 'D';
    
    const submitRes = await request('POST', `/assessments/${assessmentId}/submit`, studentToken, {
      answers,
      questionOrder: [questions[0].id, questions[1].id]
    });
    assert(submitRes.data.percentage !== undefined, 'Percentage missing from result');

    // Then view history
    const res = await request('GET', `/assessments/${assessmentId}/history`, studentToken);
    assert(Array.isArray(res.data), 'History should be an array');
    assert(res.data.length > 0, 'Should have at least one attempt');
  });

  await test('Admin views assessment analytics', async () => {
    const res = await request('GET', `/assessments/${assessmentId}/analytics`, adminToken);
    assert(res.data.totalAttempts > 0, 'Should have >= 1 attempt');
  });

  await test('Admin deletes assessment (cascade)', async () => {
    await request('DELETE', `/assessments/${assessmentId}`, adminToken);
  });
}

async function testVideoLifecycle() {
  console.log('\n--- 5. VIDEO LIFECYCLE ---');
  let videoId;

  await test('Admin creates video', async () => {
    const res = await request('POST', '/videos', adminToken, {
      title: 'QA Test Video', description: 'For testing',
      videoUrl: 'https://example.com/video.mp4', category: 'QA'
    });
    videoId = res.data.id;
    assert(videoId, 'No video ID returned');
  });

  await test('Student records video progress', async () => {
    await request('POST', `/videos/${videoId}/progress`, studentToken, {
      currentPositionSeconds: 120, percentageWatched: 45.5
    });
  });

  await test('Student retrieves video progress', async () => {
    const res = await request('GET', `/videos/${videoId}/progress`, studentToken);
    assert(res.data.percentageWatched >= 45, 'Progress not persisted correctly');
  });

  await test('Student records view', async () => {
    await request('POST', `/videos/${videoId}/view`, studentToken);
  });

  await test('Admin deletes video (cascade)', async () => {
    await request('DELETE', `/videos/${videoId}`, adminToken);
  });
}

async function testJobLifecycle() {
  console.log('\n--- 6. JOB LIFECYCLE ---');
  let jobId, studentId;

  await test('Admin creates job with all fields', async () => {
    const res = await request('POST', '/jobs', adminToken, {
      title: 'QA Engineer', companyName: 'TestCorp', description: 'Test job',
      location: 'Remote', type: 'JOB', compensation: '₹10 LPA',
      skillsRequired: 'Java, Spring', remoteType: 'REMOTE',
      expiryDate: '2030-12-31'
    });
    jobId = res.data.id;
    assert(jobId, 'No job ID returned');
  });

  await test('Student saves job (bookmark)', async () => {
    await request('POST', `/jobs/${jobId}/save`, studentToken);
  });

  await test('Student views saved jobs', async () => {
    const res = await request('GET', '/jobs/saved', studentToken);
    assert(res.data.some(j => j.id === jobId), 'Saved job not found');
  });

  await test('Student applies to job', async () => {
    await request('POST', `/jobs/${jobId}/apply`, studentToken, {
      resumeUrl: 'https://drive.google.com/resume', coverLetter: 'I am a QA expert.'
    });
  });

  await test('Student views applications', async () => {
    const res = await request('GET', '/jobs/my-applications', studentToken);
    const app = res.data.find(a => a.job.id === jobId);
    assert(app, 'Application not found');
    assert(app.status === 'PENDING', `Expected PENDING, got ${app.status}`);
    studentId = app.studentId;
  });

  await test('Duplicate application fails', async () => {
    const res = await request('POST', `/jobs/${jobId}/apply`, studentToken, {
      resumeUrl: 'https://drive.google.com/resume', coverLetter: 'Again'
    }, true);
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  });

  await test('Admin views applicants', async () => {
    const res = await request('GET', `/jobs/${jobId}/applications`, adminToken);
    assert(res.data.length > 0, 'Should have at least 1 applicant');
  });

  await test('Admin updates application status', async () => {
    await request('PUT', `/jobs/${jobId}/applications/${studentId}/status?status=SHORTLISTED`, adminToken);
  });

  await test('Student sees updated status', async () => {
    const res = await request('GET', '/jobs/my-applications', studentToken);
    const app = res.data.find(a => a.job.id === jobId);
    assert(app.status === 'SHORTLISTED', `Expected SHORTLISTED, got ${app.status}`);
  });

  await test('Student unsaves job', async () => {
    await request('DELETE', `/jobs/${jobId}/save`, studentToken);
  });

  await test('Job filtering by type works', async () => {
    const res = await request('GET', '/jobs?type=JOB', studentToken);
    assert(Array.isArray(res.data), 'Should return array');
  });

  await test('Job filtering by remoteType works', async () => {
    const res = await request('GET', '/jobs?remoteType=REMOTE', studentToken);
    assert(Array.isArray(res.data), 'Should return array');
  });

  await test('Admin deletes job (cascade)', async () => {
    await request('DELETE', `/jobs/${jobId}`, adminToken);
  });
}

async function testRealsLifecycle() {
  console.log('\n--- 7. REALS LIFECYCLE ---');
  let realId;

  await test('Admin creates reel', async () => {
    const res = await request('POST', '/reals', adminToken, {
      title: 'QA Test Reel', description: 'For testing',
      videoUrl: 'https://example.com/reel.mp4', category: 'QA'
    });
    realId = res.data.id;
    assert(realId, 'No reel ID returned');
  });

  await test('Student likes reel', async () => {
    await request('POST', `/reals/${realId}/like`, studentToken);
  });

  await test('Student comments on reel', async () => {
    await request('POST', `/reals/${realId}/comments`, studentToken, { comment: 'Great reel!' });
  });

  await test('Student records reel view', async () => {
    await request('POST', `/reals/${realId}/view`, studentToken);
  });

  await test('Student unlikes reel', async () => {
    await request('DELETE', `/reals/${realId}/like`, studentToken);
  });

  await test('Admin deletes reel (cascade)', async () => {
    await request('DELETE', `/reals/${realId}`, adminToken);
  });
}

async function testEdgeCases() {
  console.log('\n--- 8. EDGE CASES ---');

  await test('GET /courses returns array for student', async () => {
    const res = await request('GET', '/courses', studentToken);
    assert(Array.isArray(res.data), 'Should return array');
  });

  await test('GET /reals returns paginated data', async () => {
    const res = await request('GET', '/reals?page=0&size=5', studentToken);
    assert(res.data.content !== undefined || Array.isArray(res.data), 'Should return data');
  });

  await test('GET /videos returns data', async () => {
    const res = await request('GET', '/videos?page=0&size=5', studentToken);
    assert(res.data !== undefined, 'Should return data');
  });

  await test('GET /assessments returns array', async () => {
    const res = await request('GET', '/assessments', studentToken);
    assert(Array.isArray(res.data), 'Should return array');
  });

  await test('GET /jobs returns array', async () => {
    const res = await request('GET', '/jobs', studentToken);
    assert(Array.isArray(res.data), 'Should return array');
  });
}

// ============================================================
// RUNNER
// ============================================================

async function run() {
  console.log('=== EGRAM v1.1.0 — RELEASE QA TEST SUITE ===');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  await testAuthentication();
  await testAPIValidation();
  await testCourseLifecycle();
  await testAssessmentLifecycle();
  await testVideoLifecycle();
  await testJobLifecycle();
  await testRealsLifecycle();
  await testEdgeCases();

  console.log('\n============================================');
  console.log(`PASSED: ${results.passed}`);
  console.log(`FAILED: ${results.failed}`);
  console.log(`TOTAL:  ${results.passed + results.failed}`);
  console.log('============================================');

  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.details.filter(d => d.status === 'FAIL').forEach(d => {
      console.log(`  ❌ ${d.name}: ${d.reason}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED — RELEASE READY!');
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
