const http = require('http');

const PORT = 8080;
const HOST = '127.0.0.1';

let adminToken = '';
let studentToken = '';
let videoId = '';
let videoId2 = '';

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

    console.log('--- 2. Create Videos (Admin) ---');
    const v1Res = await request('POST', '/videos', adminToken, {
      title: 'Phase 11B Video 1',
      description: 'First video',
      videoUrl: 'http://test1.com/v.mp4',
      thumbnailUrl: 'http://test1.com/t.jpg'
    });
    videoId = v1Res.data.id;
    console.log(`Video 1 created: ${videoId}`);

    const v2Res = await request('POST', '/videos', adminToken, {
      title: 'Phase 11B Video 2',
      description: 'Second video',
      videoUrl: 'http://test2.com/v.mp4',
      thumbnailUrl: 'http://test2.com/t.jpg'
    });
    videoId2 = v2Res.data.id;
    console.log(`Video 2 created: ${videoId2}`);

    console.log('--- 3. Register & Login Student ---');
    const uniqueEmail = `student11b_${Date.now()}@test.com`;
    await request('POST', '/auth/register', null, {
      fullName: 'Student 11B',
      email: uniqueEmail,
      password: 'Password@123',
      role: 'STUDENT'
    }).catch(() => {}); // ignore conflict
    
    const studentRes = await request('POST', '/auth/login', null, {
      email: uniqueEmail,
      password: 'Password@123'
    });
    studentToken = studentRes.data.accessToken;

    console.log('--- 4. Update Progress (50%) ---');
    await request('POST', `/videos/${videoId}/progress`, studentToken, {
      currentPositionSeconds: 60,
      percentageWatched: 50.0
    });
    console.log('Progress updated to 50%');

    console.log('--- 5. Get Continue Watching ---');
    const continueRes = await request('GET', '/videos/continue-watching', studentToken, null);
    if (!continueRes.data.some(v => v.id === videoId)) {
      throw new Error("Video not found in continue watching");
    }
    console.log('Video found in continue watching');

    console.log('--- 6. Update Progress (95% - Completed) ---');
    await request('POST', `/videos/${videoId}/progress`, studentToken, {
      currentPositionSeconds: 115,
      percentageWatched: 95.0
    });
    console.log('Progress updated to 95%');

    console.log('--- 7. Verify Not In Continue Watching ---');
    const continueRes2 = await request('GET', '/videos/continue-watching', studentToken, null);
    if (continueRes2.data.some(v => v.id === videoId)) {
      throw new Error("Video should not be in continue watching after 95% completion");
    }
    console.log('Video removed from continue watching (as expected)');

    console.log('--- 8. Fetch Recommendations ---');
    const recRes = await request('GET', `/videos/${videoId}/recommendations`, studentToken, null);
    if (!recRes.data.some(v => v.id === videoId2)) {
      throw new Error("Video 2 not in recommendations for Video 1");
    }
    console.log('Recommendations fetch successful');

    console.log('--- 9. Increment View & Get Analytics ---');
    await request('POST', `/videos/${videoId}/view`, studentToken, null);
    const analyticsRes = await request('GET', `/videos/${videoId}/analytics`, adminToken, null);
    console.log(`Analytics: Views=${analyticsRes.data.views}, AvgWatch=${analyticsRes.data.averageWatchPercentage}%, Completion=${analyticsRes.data.completionRate}%`);

    console.log('--- 10. Cleanup ---');
    await request('DELETE', `/videos/${videoId}`, adminToken, null);
    await request('DELETE', `/videos/${videoId2}`, adminToken, null);
    console.log('Videos deleted');

    console.log('\n✅ ALL PHASE 11B TESTS PASSED!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
};

runTest();
