const http = require('http');

const PORT = 8080;
const HOST = '127.0.0.1';

let adminToken = '';
let studentToken = '';
let jobId = '';

const request = (method, path, token, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (data) {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, data: data });
            }
          } else {
            resolve({ status: res.statusCode, data: null });
          }
        } else {
          reject(new Error(`Request Failed: ${res.statusCode}\n${data}`));
        }
      });
    });

    req.on('error', e => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTest = async () => {
  try {
    console.log('--- 1. Login Admin ---');
    const adminRes = await request('POST', '/auth/login', null, {
      email: 'admin@egram.com',
      password: 'Password@123'
    });
    adminToken = adminRes.data.accessToken;

    console.log('--- 2. Create Job (Admin) ---');
    const j1Res = await request('POST', '/jobs', adminToken, {
      title: 'Software Engineer',
      companyName: 'Tech Corp',
      description: 'Java developer',
      location: 'Remote',
      type: 'JOB',
      compensation: '₹10-15 LPA',
      skillsRequired: 'Java, Spring Boot',
      remoteType: 'REMOTE',
      expiryDate: '2030-12-31'
    });
    jobId = j1Res.data.id;
    console.log(`Job created: ${jobId}`);

    console.log('--- 3. Register & Login Student ---');
    const uniqueEmail = `student11e_${Date.now()}@test.com`;
    await request('POST', '/auth/register', null, {
      fullName: 'Student 11E',
      email: uniqueEmail,
      password: 'Password@123',
      role: 'STUDENT'
    }).catch(() => {});
    
    const studentRes = await request('POST', '/auth/login', null, {
      email: uniqueEmail,
      password: 'Password@123'
    });
    studentToken = studentRes.data.accessToken;

    console.log('--- 4. Apply to Job ---');
    await request('POST', `/jobs/${jobId}/apply`, studentToken, {
      resumeUrl: 'http://docs.google.com/resume',
      coverLetter: 'I am a great fit.'
    });
    console.log('Applied successfully');

    console.log('--- 5. Verify Student Applications ---');
    const myAppsRes = await request('GET', '/jobs/my-applications', studentToken, null);
    if (!myAppsRes.data.some(app => app.jobId === jobId)) {
      throw new Error("Application not found in my-applications");
    }
    console.log('Found application in student dashboard. Status:', myAppsRes.data[0].status);

    console.log('--- 6. Verify Admin Applications ---');
    const adminAppsRes = await request('GET', `/jobs/${jobId}/applications`, adminToken, null);
    if (adminAppsRes.data.length === 0) {
      throw new Error("Admin sees 0 applications");
    }
    console.log('Admin found application. Status:', adminAppsRes.data[0].status);
    const studentId = adminAppsRes.data[0].studentId;

    console.log('--- 7. Admin Update Status ---');
    await request('PUT', `/jobs/${jobId}/applications/${studentId}/status?status=SHORTLISTED`, adminToken, null);
    console.log('Status updated to SHORTLISTED');

    console.log('--- 8. Verify Updated Status ---');
    const myAppsRes2 = await request('GET', '/jobs/my-applications', studentToken, null);
    if (myAppsRes2.data[0].status !== 'SHORTLISTED') {
      throw new Error(`Expected SHORTLISTED, got ${myAppsRes2.data[0].status}`);
    }
    console.log('Student sees updated status');

    console.log('--- 9. Cleanup ---');
    await request('DELETE', `/jobs/${jobId}`, adminToken, null);
    console.log('Job deleted');

    console.log('\n✅ ALL PHASE 11E TESTS PASSED!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
};

runTest();
