$ErrorActionPreference = 'Stop'

try {
    # 1. Admin Login
    $adminLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"admin@egram.com","password":"Password@123"}'
    $adminJwt = $adminLogin.accessToken
    Write-Output "Admin Login: OK"

    # 2. Create Job
    $jobPayload = @{
        title = "Software Engineer Intern"
        companyName = "Tech Corp"
        description = "Develop cool things"
        location = "Remote"
        type = "INTERNSHIP"
        applyUrl = "https://techcorp.com/apply"
    } | ConvertTo-Json
    $jobRes = Invoke-RestMethod -Uri http://localhost:8080/api/jobs -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $jobPayload
    $jobId = $jobRes.id
    Write-Output "Create Job: OK, ID=$jobId"

    # 3. Update Job
    $jobUpdatePayload = @{
        title = "Senior Software Engineer"
        companyName = "Tech Corp"
        description = "Develop big things"
        location = "New York"
        type = "JOB"
        applyUrl = "https://techcorp.com/apply-senior"
        active = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId -Method Put -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $jobUpdatePayload | Out-Null
    Write-Output "Update Job: OK"

    # 4. Student Register/Login
    $studentPayload = @{
        fullName = "Test Student Jobs"
        email = "student_jobs@test.com"
        password = "Password@123"
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $studentPayload | Out-Null
        Write-Output "Student Register: OK"
    } catch {
        Write-Output "Student Register: (Already registered or error)"
    }

    $studentLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"student_jobs@test.com","password":"Password@123"}'
    $studentJwt = $studentLogin.accessToken
    Write-Output "Student Login: OK"

    # 5. Browse Jobs
    $jobs = Invoke-RestMethod -Uri http://localhost:8080/api/jobs -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Browse Jobs: OK, count=$($jobs.Count)"

    # 6. View Details
    $jobDetails = Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Get Job: OK, title=$($jobDetails.title)"

    # 7. Save Job
    Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId/save -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Save Job: OK"

    # 8. Duplicate Save (Should Fail)
    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId/save -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
        Write-Output "Duplicate Save Job: FAILED (Should have thrown error)"
    } catch {
        Write-Output "Duplicate Save Job: Blocked correctly"
    }

    # 9. View Saved Jobs
    $savedJobs = Invoke-RestMethod -Uri http://localhost:8080/api/jobs/saved -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "View Saved Jobs: OK, count=$($savedJobs.Count)"

    # 10. Unsave Job
    Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId/save -Method Delete -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Unsave Job: OK"

    # 11. Apply Job
    Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId/apply -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Apply Job: OK"

    # 12. Duplicate Apply (Should Fail)
    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId/apply -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
        Write-Output "Duplicate Apply Job: FAILED (Should have thrown error)"
    } catch {
        Write-Output "Duplicate Apply Job: Blocked correctly"
    }

    # 13. View Applied Jobs
    $appliedJobs = Invoke-RestMethod -Uri http://localhost:8080/api/jobs/applied -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "View Applied Jobs: OK, count=$($appliedJobs.Count)"

    # 14. Delete Job (Cascade test)
    Invoke-RestMethod -Uri http://localhost:8080/api/jobs/$jobId -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Job: OK"

} catch {
    Write-Output "Error occurred: $_"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}
