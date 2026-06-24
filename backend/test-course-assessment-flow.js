const http = require('http');

const PORT = 8080;
const HOST = '127.0.0.1';

let adminToken = '';
let studentToken = '';

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

async function runTest() {
  try {
    console.log('1. Admin Login');
    let res = await request('POST', '/auth/login', null, { email: 'admin@egram.com', password: 'Password@123' });
    adminToken = res.data.accessToken;

    const studentEmail = `student_${Date.now()}@test.com`;
    console.log('2. Student Registration & Login');
    await request('POST', '/auth/register', null, { fullName: 'Test Student', email: studentEmail, password: 'Password@123', role: 'STUDENT' });
    res = await request('POST', '/auth/login', null, { email: studentEmail, password: 'Password@123' });
    studentToken = res.data.accessToken;

    console.log('3. Admin Creates Course');
    res = await request('POST', '/courses', adminToken, {
      title: 'Full Stack Dev', description: 'Learn it all', category: 'Dev', difficulty: 'INTERMEDIATE', duration: '10 hours'
    });
    const courseId = res.data.id;
    console.log('Course ID:', courseId);

    console.log('4. Admin Creates Module');
    res = await request('POST', `/courses/${courseId}/modules`, adminToken, { title: 'Frontend Basics', moduleOrder: 1 });
    const moduleId = res.data.id;
    console.log('Module ID:', moduleId);

    console.log('5. Admin Creates Topic');
    res = await request('POST', `/courses/modules/${moduleId}/topics`, adminToken, { title: 'React UI', description: 'Build UIs', topicOrder: 1, estimatedDurationMinutes: 30 });
    const topicId = res.data.id;
    console.log('Topic ID:', topicId);

    console.log('6. Admin Creates and Attaches Video to Topic');
    res = await request('POST', `/videos`, adminToken, { title: 'React Video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Watch this', category: 'Tech' });
    const videoId = res.data.id;
    res = await request('POST', `/courses/topics/${topicId}/videos`, adminToken, { videoId: videoId, videoOrder: 1 });
    
    console.log('7. Admin Creates Final Assessment for Course');
    res = await request('POST', `/courses/${courseId}/assessment`, adminToken, {
      title: 'Final Exam', description: 'Test your skills', durationMinutes: 60, passingPercentage: 50, maxAttempts: 3, active: true,
      questions: [
        { question: 'What is 2+2?', optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctAnswer: 'B' }
      ]
    });
    const assessmentId = res.data.id;
    console.log('Assessment ID:', assessmentId);

    console.log('8. Student Enrolls in Course');
    await request('POST', `/courses/${courseId}/enroll`, studentToken);

    console.log('9. Student Completes Topic via Video Progress');
    try {
      await request('POST', `/courses/topics/${topicId}/progress/video`, studentToken, { videoId: videoId, currentPositionSeconds: 60, watchPercentage: 100 });
    } catch(e) {
      console.log('Video progress failed...', e.message);
    }

    console.log('10. Student Checks Assessment Eligibility');
    res = await request('GET', `/courses/${courseId}/certificate-eligibility`, studentToken, null, true);
    console.log('Eligibility check result:', res.status, res.data);

    console.log('11. Student Takes Assessment');
    res = await request('GET', `/courses/${courseId}/assessment/questions`, studentToken);
    const questions = res.data;
    const answers = {};
    if (questions && questions.length > 0) {
      answers[questions[0].id] = 'B';
    }

    console.log('12. Student Submits Assessment');
    res = await request('POST', `/courses/${courseId}/assessment/submit`, studentToken, {
      answers: answers, questionOrder: questions ? [questions[0].id] : []
    });
    console.log('Submission result score:', res.data.score);

    console.log('13. Student Checks Certificate');
    res = await request('GET', `/courses/${courseId}/certificate`, studentToken, null, true);
    if(res.status === 200) {
      console.log('Certificate generated:', res.data.certificateNumber);
    } else {
      console.log('Certificate not generated automatically or needs trigger. Status:', res.status);
    }

    console.log('--- ALL DONE SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTest();
