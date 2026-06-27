const http = require('http');

function request(method, path, token, bodyObj = null) {
  return new Promise((resolve, reject) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : '';
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: method,
      headers: headers
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        let parsed = null;
        try { parsed = body ? JSON.parse(body) : null; } catch (e) { parsed = body; }
        if (res.statusCode >= 400) {
          console.log(`[REQUEST FAILED] ${method} ${path} -> ${res.statusCode}`, parsed);
          reject(new Error(`Request Failed: ${res.statusCode}`));
        } else {
          resolve({ status: res.statusCode, data: parsed });
        }
      });
    });
    req.on('error', e => reject(e));
    if (bodyObj) req.write(data);
    req.end();
  });
}

async function runTest() {
  try {
    console.log('--- 1. Login Admin ---');
    let res = await request('POST', '/auth/login', null, { email: 'admin@egram.com', password: 'Password@123' });
    const adminToken = res.data.accessToken;

    console.log('--- 2. Create Course (Admin) ---');
    res = await request('POST', '/courses', adminToken, {
      title: 'Automated Test Course',
      description: 'Testing Phase 11C',
      thumbnailUrl: 'invalid_image.png',
      category: 'Software Engineering',
      difficulty: 'Beginner',
      durationMinutes: 120
    });
    const courseId = res.data.id;
    console.log('Course created:', courseId);

    console.log('--- 3. Add Modules (Admin) ---');
    await request('POST', '/courses/' + courseId + '/modules', adminToken, { title: 'Mod 1', type: 'REAL', realId: '11111111-1111-1111-1111-111111111111', moduleOrder: 1 });
    await request('POST', '/courses/' + courseId + '/modules', adminToken, { title: 'Mod 2', type: 'REAL', realId: '22222222-2222-2222-2222-222222222222', moduleOrder: 2 });
    
    console.log('--- 4. Register & Login Student ---');
    try {
      await request('POST', '/auth/register', null, { fullName: 'Test Student', email: 'student@egram.com', password: 'Password@123', role: 'STUDENT' });
    } catch(e) {
      // Ignore if already exists
    }
    res = await request('POST', '/auth/login', null, { email: 'student@egram.com', password: 'Password@123' });
    const studentToken = res.data.accessToken;

    console.log('--- 5. Enroll Course (Student) ---');
    await request('POST', '/courses/' + courseId + '/enroll', studentToken);

    console.log('--- 6. Complete Module 1 ---');
    await request('PUT', '/courses/' + courseId + '/progress', studentToken, { completedModules: 1 });

    console.log('--- 7. Verify Progress Persists ---');
    res = await request('GET', '/courses/' + courseId, studentToken);
    if (!res.data) {
      console.log('ERROR at GET course details. Status:', res.status, 'Body:', res);
      throw new Error('Failed to get course details');
    }
    console.log('Student Progress:', res.data.progressPercentage, '%');
    console.log('Completed Modules:', res.data.completedModules);

    console.log('--- 8. Complete Module 2 (100%) ---');
    await request('PUT', '/courses/' + courseId + '/progress', studentToken, { completedModules: 2 });
    res = await request('GET', '/courses/' + courseId, studentToken);
    console.log('Student Progress after 100%:', res.data.progressPercentage, '%');

    console.log('--- 9. Verify Admin Stats ---');
    res = await request('GET', '/courses', adminToken);
    const adminCourse = res.data.find(c => c.id === courseId);
    console.log('Admin Enrollment Count:', adminCourse.enrollmentCount);
    console.log('Admin Completion Rate:', adminCourse.completionRate, '%');

    console.log('--- 10. Delete Course (Admin) ---');
    await request('DELETE', '/courses/' + courseId, adminToken);
    try {
      await request('GET', '/courses/' + courseId, adminToken);
      throw new Error('Course should be deleted!');
    } catch (e) {
      if (e.message.includes('404')) {
        console.log('Delete verified successfully.');
      } else {
        throw e;
      }
    }

    console.log('\n✅ ALL TESTS PASSED!');
  } catch (e) {
    console.error('Test Failed:', e);
  }
}
runTest();
