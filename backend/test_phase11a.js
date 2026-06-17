const http = require('http');

function request(method, path, token, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        if (res.statusCode >= 400) {
          console.error(`[REQUEST FAILED] ${method} ${path} -> ${res.statusCode}`, data);
          reject(new Error(`Request Failed: ${res.statusCode}`));
        } else {
          resolve({ status: res.statusCode, data: parsed });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- 1. Login Admin ---');
    let res = await request('POST', '/auth/login', null, { email: 'admin@egram.com', password: 'Password@123' });
    const adminToken = res.data.accessToken;
    if (!adminToken) throw new Error("No token returned");

    console.log('--- 2. Create Real (Admin) ---');
    res = await request('POST', '/reals', adminToken, {
      title: 'Phase 11A Test Real',
      description: 'Testing Reals Enhancement',
      videoUrl: 'http://example.com/video.mp4',
      thumbnailUrl: 'http://example.com/thumb.jpg'
    });
    const realId = res.data.id;
    console.log('Real created:', realId);

    console.log('--- 3. Register & Login Student ---');
    try {
      await request('POST', '/auth/register', null, { fullName: 'Student 11A', email: 'student11a@egram.com', password: 'Password@123', role: 'STUDENT' });
    } catch (e) {
      if (!e.message.includes('409') && !e.message.includes('400')) throw e;
    }
    res = await request('POST', '/auth/login', null, { email: 'student11a@egram.com', password: 'Password@123' });
    const studentToken = res.data.accessToken;

    console.log('--- 4. Increment View ---');
    await request('POST', `/reals/${realId}/view`, studentToken, null);
    console.log('View recorded');

    console.log('--- 5. Like Real ---');
    await request('POST', `/reals/${realId}/like`, studentToken, null);
    console.log('Real liked');

    console.log('--- 6. Save Real ---');
    await request('POST', `/reals/${realId}/save`, studentToken, null);
    console.log('Real saved');

    console.log('--- 7. Add Comment ---');
    await request('POST', `/reals/${realId}/comments`, studentToken, { comment: 'Amazing reel!' });
    console.log('Comment added');

    console.log('--- 8. Fetch Paginated Reals (Verify Analytics) ---');
    res = await request('GET', '/reals?page=0&size=10', studentToken, null);
    const reals = res.data.content;
    const theReal = reals.find(r => r.id === realId);
    if (!theReal) throw new Error("Real not found in feed");
    
    console.log(`Analytics for Real: Views=${theReal.viewCount}, Likes=${theReal.likeCount}, Comments=${theReal.commentCount}, Liked=${theReal.liked}, Saved=${theReal.saved}`);
    
    if (theReal.viewCount !== 1) throw new Error(`Expected 1 view, got ${theReal.viewCount}`);
    if (theReal.likeCount !== 1) throw new Error(`Expected 1 like, got ${theReal.likeCount}`);
    if (theReal.commentCount !== 1) throw new Error(`Expected 1 comment, got ${theReal.commentCount}`);
    if (theReal.liked !== true) throw new Error("Expected liked to be true");
    if (theReal.saved !== true) throw new Error("Expected saved to be true");

    console.log('--- 9. Delete Real (Cleanup) ---');
    await request('DELETE', `/reals/${realId}`, adminToken, null);
    console.log('Real deleted');

    console.log('\n✅ ALL PHASE 11A TESTS PASSED!');

  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

runTests();
