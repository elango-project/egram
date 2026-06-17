$ErrorActionPreference = 'Stop'

try {
    $adminLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"admin@egram.com","password":"Password@123"}'
    $adminJwt = $adminLogin.accessToken
    Write-Output "Admin Login: OK"

    $assessmentPayload = @{
        title = "My Assessment"
        description = "Test assessment description"
        durationMinutes = 30
        passingPercentage = 50
    } | ConvertTo-Json

    $assessmentRes = Invoke-RestMethod -Uri http://localhost:8080/api/assessments -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $assessmentPayload
    $assessmentId = $assessmentRes.id
    Write-Output "Create Assessment: OK, ID=$assessmentId"

    $updatePayload = @{
        title = "Updated Assessment"
        description = "Updated desc"
        durationMinutes = 60
        passingPercentage = 75
    } | ConvertTo-Json
    Invoke-RestMethod -Uri http://localhost:8080/api/assessments/$assessmentId -Method Put -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $updatePayload | Out-Null
    Write-Output "Update Assessment: OK"

    $question1Payload = @{
        question = "What is 1+1?"
        optionA = "1"
        optionB = "2"
        optionC = "3"
        optionD = "4"
        correctAnswer = "B"
    } | ConvertTo-Json

    $question1Res = Invoke-RestMethod -Uri http://localhost:8080/api/assessments/$assessmentId/questions -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $question1Payload
    $question1Id = $question1Res.id
    Write-Output "Add Question 1: OK, QID=$question1Id"

    $question2Payload = @{
        question = "What is capital of France?"
        optionA = "Paris"
        optionB = "London"
        optionC = "Berlin"
        optionD = "Madrid"
        correctAnswer = "A"
    } | ConvertTo-Json

    $question2Res = Invoke-RestMethod -Uri http://localhost:8080/api/assessments/$assessmentId/questions -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $question2Payload
    $question2Id = $question2Res.id
    Write-Output "Add Question 2: OK, QID=$question2Id"

    $studentPayload = @{
        fullName = "Test Student Assessments"
        email = "student_assessments@test.com"
        password = "Password@123"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $studentPayload | Out-Null
        Write-Output "Student Register: OK"
    } catch {
        Write-Output "Student Register: (Already registered or error)"
    }

    $studentLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"student_assessments@test.com","password":"Password@123"}'
    $studentJwt = $studentLogin.accessToken
    Write-Output "Student Login: OK"

    $feed = Invoke-RestMethod -Uri http://localhost:8080/api/assessments -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Browse Assessments: OK, count=$($feed.Count)"

    $getAssessment = Invoke-RestMethod -Uri http://localhost:8080/api/assessments/$assessmentId -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Get Assessment: OK, title=$($getAssessment.title)"

    $questions = Invoke-RestMethod -Uri http://localhost:8080/api/assessments/$assessmentId/questions -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Get Questions for Student: OK, count=$($questions.Count)"

    $submitPayload = @"
{
  "answers": {
    "$question1Id": "B",
    "$question2Id": "C"
  }
}
"@
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/assessments/$assessmentId/submit" -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $studentJwt"} -Body $submitPayload
    Write-Output "Submit Assessment: OK, Score=$($result.score) / $($result.totalQuestions), Percentage=$($result.percentage)%, Passed=$($result.passed)"

    $myResult = Invoke-RestMethod -Uri "http://localhost:8080/api/assessments/$assessmentId/result" -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Get My Result: OK, Score=$($myResult.score) / $($myResult.totalQuestions)"

    Invoke-RestMethod -Uri "http://localhost:8080/api/assessments/questions/$question1Id" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Question 1: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/assessments/$assessmentId" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Assessment: OK"

} catch {
    Write-Output "Error occurred: $_"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}
