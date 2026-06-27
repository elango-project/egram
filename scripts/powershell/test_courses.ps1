$ErrorActionPreference = 'Stop'

try {
    $adminLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"admin@egram.com","password":"Password@123"}'
    $adminJwt = $adminLogin.accessToken
    Write-Output "Admin Login: OK"

    $coursePayload = @{
        title = "My Course"
        description = "Test course description"
        thumbnailUrl = "http://example.com/course_thumb.jpg"
    } | ConvertTo-Json

    $courseRes = Invoke-RestMethod -Uri http://localhost:8080/api/courses -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $coursePayload
    $courseId = $courseRes.id
    Write-Output "Create Course: OK, ID=$courseId"

    $updatePayload = @{
        title = "Updated Course"
        description = "Updated desc"
        thumbnailUrl = "http://example.com/new_thumb.jpg"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri http://localhost:8080/api/courses/$courseId -Method Put -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $updatePayload | Out-Null
    Write-Output "Update Course: OK"

    $realId = [guid]::NewGuid().ToString()

    $modulePayload = @{
        title = "Module 1"
        moduleOrder = 1
        realId = $realId
        longFormVideoId = $null
    } | ConvertTo-Json

    $moduleRes = Invoke-RestMethod -Uri http://localhost:8080/api/courses/$courseId/modules -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $modulePayload
    $moduleId = $moduleRes.id
    Write-Output "Add Module: OK, ModuleID=$moduleId"

    $studentPayload = @{
        fullName = "Test Student Courses"
        email = "student_courses@test.com"
        password = "Password@123"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $studentPayload | Out-Null
        Write-Output "Student Register: OK"
    } catch {
        Write-Output "Student Register: (Already registered or error)"
    }

    $studentLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"student_courses@test.com","password":"Password@123"}'
    $studentJwt = $studentLogin.accessToken
    Write-Output "Student Login: OK"

    $feed = Invoke-RestMethod -Uri http://localhost:8080/api/courses -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Browse Courses: OK, count=$($feed.Count)"

    $getCourse = Invoke-RestMethod -Uri http://localhost:8080/api/courses/$courseId -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Get Course: OK, title=$($getCourse.title)"

    Invoke-RestMethod -Uri "http://localhost:8080/api/courses/$courseId/enroll" -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Enroll Course: OK"

    $progressPayload = @{ completedModules = 1 } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/courses/$courseId/progress" -Method Put -ContentType "application/json" -Headers @{Authorization="Bearer $studentJwt"} -Body $progressPayload | Out-Null
    Write-Output "Update Progress: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/courses/modules/$moduleId" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Module: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/courses/$courseId" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Course: OK"

} catch {
    Write-Output "Error occurred: $_"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}
