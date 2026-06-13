$ErrorActionPreference = 'Stop'

try {
    $adminLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"admin@egram.com","password":"Password@123"}'
    $adminJwt = $adminLogin.accessToken
    Write-Output "Admin Login: OK"

    $videoPayload = @{
        title = "My Long Form Video"
        description = "Test video description"
        videoUrl = "http://example.com/video.mp4"
        thumbnailUrl = "http://example.com/thumb.jpg"
    } | ConvertTo-Json

    $uploadRes = Invoke-RestMethod -Uri http://localhost:8080/api/videos -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $adminJwt"} -Body $videoPayload
    $videoId = $uploadRes.id
    Write-Output "Upload Video: OK, ID=$videoId"

    $studentPayload = @{
        fullName = "Test Student"
        email = "student2@test.com"
        password = "Password@123"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $studentPayload | Out-Null
        Write-Output "Student Register: OK"
    } catch {
        Write-Output "Student Register: (Already registered or error)"
    }

    $studentLogin = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"student2@test.com","password":"Password@123"}'
    $studentJwt = $studentLogin.accessToken
    Write-Output "Student Login: OK"

    $feed = Invoke-RestMethod -Uri http://localhost:8080/api/videos -Method Get -Headers @{Authorization="Bearer $studentJwt"}
    Write-Output "Feed: OK, count=$($feed.Count)"

    Invoke-RestMethod -Uri "http://localhost:8080/api/videos/$videoId/like" -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Like Video: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/videos/$videoId/save" -Method Post -Headers @{Authorization="Bearer $studentJwt"} | Out-Null
    Write-Output "Save Video: OK"

    $commentPayload = @{ comment = "Great long video!" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/videos/$videoId/comments" -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $studentJwt"} -Body $commentPayload | Out-Null
    Write-Output "Comment Video: OK"

    Invoke-RestMethod -Uri "http://localhost:8080/api/videos/$videoId" -Method Delete -Headers @{Authorization="Bearer $adminJwt"} | Out-Null
    Write-Output "Delete Video: OK"

} catch {
    Write-Output "Error occurred: $_"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}
