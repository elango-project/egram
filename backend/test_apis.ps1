$ErrorActionPreference = 'Stop'

try {
    $adminLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"admin@egram.com","password":"Password@123"}'
    $adminJwt = $adminLogin.accessToken
    Write-Output "Admin Login: OK"

    $realPayload = @{
        title = "My First Real"
        description = "Test description"
        videoUrl = "http://example.com/video.mp4"
        thumbnailUrl = "http://example.com/thumb.jpg"
    } | ConvertTo-Json

    $uploadRes = Invoke-RestMethod -Uri http://localhost:8080/api/reals -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $realPayload
    $realId = $uploadRes.id
    Write-Output "Upload Real: OK, ID=$realId"

    $studentPayload = @{
        fullName = "Test Student"
        email = "student@test.com"
        password = "Password@123"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $studentPayload | Out-Null
        Write-Output "Student Register: OK"
    } catch {
        Write-Output "Student Register: (Already registered or error)"
    }

    $studentLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"student@test.com","password":"Password@123"}'
    $studentJwt = $studentLogin.accessToken
    Write-Output "Student Login: OK"

    $feed = Invoke-RestMethod -Uri http://localhost:8080/api/reals -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Feed: OK, count=$($feed.Count)"

    Invoke-RestMethod -Uri "http://localhost:8080/api/reals/$realId/like" -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Like Real: OK"

    $commentPayload = @{ comment = "Great video!" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/reals/$realId/comments" -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $studentJwt"} -Body $commentPayload | Out-Null
    Write-Output "Comment Real: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/reals/$realId" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Real: OK"

} catch {
    Write-Output "Error occurred: $_"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}
