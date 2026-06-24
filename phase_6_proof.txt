
==================================================
LMS Proof
==================================================

--- Action: Module creation ---
Endpoint: POST /courses/de3dc23a-5a32-421a-a75c-439a1c479c1a/modules
Request Payload:
{
  "title": "Proof Module",
  "moduleOrder": 1
}
Response Payload:
{
  "id": "f995f94d-86db-415e-a371-bf4bd2d1b1e3",
  "title": "Proof Module",
  "moduleOrder": 1,
  "topics": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: f995f94d-86db-415e-a371-bf4bd2d1b1e3)

--- Action: Topic creation ---
Endpoint: POST /courses/modules/f995f94d-86db-415e-a371-bf4bd2d1b1e3/topics
Request Payload:
{
  "title": "Proof Topic",
  "description": "Desc",
  "estimatedDurationMinutes": 10,
  "topicOrder": 1
}
Response Payload:
{
  "id": "80283b77-89af-4dbc-ad9a-514db5c9cb8a",
  "title": "Proof Topic",
  "description": "Desc",
  "estimatedDurationMinutes": 10,
  "topicOrder": 1,
  "hasQuickLearningPath": null,
  "hasDeepLearningPath": null,
  "hasQuiz": null,
  "hasAssessment": null,
  "reels": null,
  "videos": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: 80283b77-89af-4dbc-ad9a-514db5c9cb8a)

--- Action: Reel attachment ---
Endpoint: POST /courses/topics/80283b77-89af-4dbc-ad9a-514db5c9cb8a/reels
Request Payload:
{
  "reelId": "3732b19d-aae5-4ed5-961f-0d3ca6566957",
  "reelOrder": 1
}
Response Payload:
{
  "id": "15a4a6d6-7ccd-421f-8cbb-6fbad55bec1d",
  "reelId": "3732b19d-aae5-4ed5-961f-0d3ca6566957",
  "title": "Test Reel",
  "thumbnailUrl": "https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg",
  "reelOrder": 1
}
Database Verification: SUCCESS (Entity persisted and returned ID: 15a4a6d6-7ccd-421f-8cbb-6fbad55bec1d)

--- Action: Video attachment ---
Endpoint: POST /courses/topics/80283b77-89af-4dbc-ad9a-514db5c9cb8a/videos
Request Payload:
{
  "videoId": "b23a0e22-89cb-417a-91cc-b4055b6bea7c",
  "videoOrder": 1
}
Response Payload:
{
  "id": "e736e86e-39de-465a-8d63-f9e2a4190fef",
  "videoId": "b23a0e22-89cb-417a-91cc-b4055b6bea7c",
  "videoOrder": 1,
  "title": "Test Video",
  "thumbnailUrl": "https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg"
}
Database Verification: SUCCESS (Entity persisted and returned ID: e736e86e-39de-465a-8d63-f9e2a4190fef)

--- Action: Topic quiz creation ---
Endpoint: POST /courses/topics/80283b77-89af-4dbc-ad9a-514db5c9cb8a/quiz
Request Payload:
{
  "title": "Proof Quiz",
  "passingPercentage": 50,
  "maxAttempts": 3,
  "questions": [
    {
      "question": "Is this real?",
      "optionA": "Yes",
      "optionB": "No",
      "optionC": "Maybe",
      "optionD": "Idk",
      "correctAnswer": "A"
    }
  ]
}
Response Payload:
{
  "id": "f2531bd6-504d-43ed-8bdb-a42cba27a574",
  "title": "Proof Quiz",
  "passingPercentage": 50,
  "maxAttempts": 3,
  "questions": [
    {
      "id": "71b6b064-583e-4258-a33e-a9773e6fdd76",
      "question": "Is this real?",
      "optionA": "Yes",
      "optionB": "No",
      "optionC": "Maybe",
      "optionD": "Idk",
      "correctAnswer": "A",
      "explanation": null
    }
  ]
}
Database Verification: SUCCESS (Entity persisted and returned ID: f2531bd6-504d-43ed-8bdb-a42cba27a574)

--- Action: Assessment creation ---
Endpoint: POST /courses/de3dc23a-5a32-421a-a75c-439a1c479c1a/assessment
Request Payload:
{
  "title": "Proof Assessment",
  "description": "Final exam",
  "passingPercentage": 100,
  "durationMinutes": 10,
  "maxAttempts": 3,
  "questions": [
    {
      "question": "Did it work?",
      "optionA": "Yes",
      "optionB": "No",
      "optionC": "Maybe",
      "optionD": "Idk",
      "correctAnswer": "A"
    }
  ]
}
Response Payload:
{
  "id": "58cbaf56-6eba-40fb-9218-30a4b624fef5",
  "title": "Proof Assessment",
  "description": "Final exam",
  "passingPercentage": 100,
  "durationMinutes": 10,
  "maxAttempts": 3,
  "active": true,
  "courseTitle": "Proof Course",
  "courseId": "de3dc23a-5a32-421a-a75c-439a1c479c1a",
  "questions": [
    {
      "id": "2da73494-bcf2-42f0-ab00-e50c1e5da29b",
      "question": "Did it work?",
      "optionA": "Yes",
      "optionB": "No",
      "optionC": "Maybe",
      "optionD": "Idk"
    }
  ],
  "createdAt": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: 58cbaf56-6eba-40fb-9218-30a4b624fef5)

--- Action: Assessment unlock ---
Endpoint: GET /courses/de3dc23a-5a32-421a-a75c-439a1c479c1a/certificate-eligibility
Request Payload:
null
Response Payload:
{
  "courseId": "de3dc23a-5a32-421a-a75c-439a1c479c1a",
  "studentId": "091d2f78-a56d-4fff-ac5a-a8672aee6f18",
  "eligible": true,
  "completedTopics": 1,
  "totalTopics": 1,
  "progressPercentage": 100
}
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

--- Action: Assessment submission ---
Endpoint: POST /courses/de3dc23a-5a32-421a-a75c-439a1c479c1a/assessment/submit
Request Payload:
{
  "answers": {
    "2da73494-bcf2-42f0-ab00-e50c1e5da29b": "A"
  }
}
Response Payload:
{
  "assessmentId": "58cbaf56-6eba-40fb-9218-30a4b624fef5",
  "score": 1,
  "totalQuestions": 1,
  "percentage": 100,
  "passed": true,
  "message": "Congratulations! You passed the assessment.",
  "submittedAt": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: Congratulations! You passed the assessment.)

--- Action: Certificate generation/rendering ---
Endpoint: GET /certificates/my-certificates
Request Payload:
null
Response Payload:
[
  {
    "id": "0f019f83-530c-4909-b3ff-44cd51724a72",
    "courseId": "de3dc23a-5a32-421a-a75c-439a1c479c1a",
    "courseTitle": "Proof Course",
    "studentName": "Student",
    "certificateNumber": "EGR-PROOFCOURSE-2026-7AF54",
    "verificationCode": "EGR-D45DDEAB",
    "issuedAt": "2026-06-24T20:18:41.032019"
  }
]
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

==================================================
Opportunity API Verification
==================================================

--- Action: Create Job ---
Endpoint: POST /opportunities
Request Payload:
{
  "title": "Software Engineer",
  "companyName": "Tech Corp",
  "type": "JOB",
  "employmentType": "FULL_TIME",
  "salaryPackage": "15 LPA",
  "skillsRequired": "Java, React",
  "deadline": "2026-12-31"
}
Response Payload:
{
  "id": "76f26d9c-2728-4cf9-8d7b-7e0339dbd58d",
  "title": "Software Engineer",
  "companyName": "Tech Corp",
  "description": null,
  "location": null,
  "type": "JOB",
  "applyUrl": null,
  "active": true,
  "createdAt": "2026-06-24T20:18:41.1018676",
  "employmentType": "FULL_TIME",
  "duration": null,
  "stipend": null,
  "salaryPackage": "15 LPA",
  "skillsRequired": "Java, React",
  "experienceRequired": null,
  "companyLogoUrl": null,
  "remoteType": null,
  "deadline": "2026-12-31",
  "applicationCount": 0,
  "saved": false,
  "applied": false,
  "applicationStatus": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: 76f26d9c-2728-4cf9-8d7b-7e0339dbd58d)

--- Action: Create Internship ---
Endpoint: POST /opportunities
Request Payload:
{
  "title": "Frontend Intern",
  "companyName": "Design Studio",
  "type": "INTERNSHIP",
  "duration": "6 months",
  "stipend": "25000",
  "skillsRequired": "React, CSS",
  "deadline": "2026-12-31"
}
Response Payload:
{
  "id": "6f903ac0-09f7-4443-a075-4773c510ae99",
  "title": "Frontend Intern",
  "companyName": "Design Studio",
  "description": null,
  "location": null,
  "type": "INTERNSHIP",
  "applyUrl": null,
  "active": true,
  "createdAt": "2026-06-24T20:18:41.1319139",
  "employmentType": null,
  "duration": "6 months",
  "stipend": "25000",
  "salaryPackage": null,
  "skillsRequired": "React, CSS",
  "experienceRequired": null,
  "companyLogoUrl": null,
  "remoteType": null,
  "deadline": "2026-12-31",
  "applicationCount": 0,
  "saved": false,
  "applied": false,
  "applicationStatus": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: 6f903ac0-09f7-4443-a075-4773c510ae99)

--- Action: Fetch Jobs ---
Endpoint: GET /opportunities?type=JOB
Request Payload:
null
Response Payload:
[
  {
    "id": "76f26d9c-2728-4cf9-8d7b-7e0339dbd58d",
    "title": "Software Engineer",
    "companyName": "Tech Corp",
    "description": null,
    "location": null,
    "type": "JOB",
    "applyUrl": null,
    "active": true,
    "createdAt": "2026-06-24T20:18:41.101868",
    "employmentType": "FULL_TIME",
    "duration": null,
    "stipend": null,
    "salaryPackage": "15 LPA",
    "skillsRequired": "Java, React",
    "experienceRequired": null,
    "companyLogoUrl": null,
    "remoteType": null,
    "deadline": "2026-12-31",
    "applicationCount": 0,
    "saved": false,
    "applied": false,
    "applicationStatus": null
  }
]
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

--- Action: Fetch Internships ---
Endpoint: GET /opportunities?type=INTERNSHIP
Request Payload:
null
Response Payload:
[
  {
    "id": "6f903ac0-09f7-4443-a075-4773c510ae99",
    "title": "Frontend Intern",
    "companyName": "Design Studio",
    "description": null,
    "location": null,
    "type": "INTERNSHIP",
    "applyUrl": null,
    "active": true,
    "createdAt": "2026-06-24T20:18:41.131914",
    "employmentType": null,
    "duration": "6 months",
    "stipend": "25000",
    "salaryPackage": null,
    "skillsRequired": "React, CSS",
    "experienceRequired": null,
    "companyLogoUrl": null,
    "remoteType": null,
    "deadline": "2026-12-31",
    "applicationCount": 0,
    "saved": false,
    "applied": false,
    "applicationStatus": null
  }
]
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

--- Action: Save Opportunity ---
Endpoint: POST /opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/save
Request Payload:
{}
Response Payload:
"OK"
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

--- Action: Apply Opportunity ---
Endpoint: POST /opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/apply
Request Payload:
{
  "resumeUrl": "http://test.com/resume.pdf",
  "coverLetter": "I am a great fit."
}
Response Payload:
"OK"
Database Verification: SUCCESS (Entity persisted and returned ID: OK)

--- Action: Prevent duplicate saves ---
Endpoint: POST /opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/save
Request Payload:
{}
Response Payload:
{
  "status": 400,
  "error": "Bad Request",
  "message": "Job already saved",
  "path": "/api/opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/save",
  "timestamp": "2026-06-24T20:18:41.2915354",
  "validationErrors": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: Job already saved)

--- Action: Prevent duplicate applications ---
Endpoint: POST /opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/apply
Request Payload:
{
  "resumeUrl": "http://test.com/resume.pdf",
  "coverLetter": "I am a great fit."
}
Response Payload:
{
  "status": 400,
  "error": "Bad Request",
  "message": "Already applied for this job",
  "path": "/api/opportunities/76f26d9c-2728-4cf9-8d7b-7e0339dbd58d/apply",
  "timestamp": "2026-06-24T20:18:41.3141325",
  "validationErrors": null
}
Database Verification: SUCCESS (Entity persisted and returned ID: Already applied for this job)