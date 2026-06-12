@echo off
echo ==============================================
echo      Starting Egram V2 Ecosystem
echo ==============================================
echo.
echo Make sure you have set your MySQL password!
echo If your MySQL password is not empty, please edit this file and change DB_PASSWORD.
echo.

set DB_PASSWORD=1234
set GEMINI_API_KEY=AIzaSyDLSHioA-4slfyu6CymxMqQIW9QXublYt8

echo Starting Spring Boot Backend (Port 8080)...
start "Egram Backend" cmd /k "cd backend && set DB_PASSWORD=%DB_PASSWORD% && mvn spring-boot:run"

echo Starting Python AI Service (Port 8001)...
start "Egram AI Service" cmd /k "cd ai-service && set GEMINI_API_KEY=%GEMINI_API_KEY% && uvicorn app.main:app --reload --port 8001"

echo Starting React Frontend (Port 3000/3001)...
start "Egram Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services are starting in separate windows!
echo - Wait for Spring Boot to say "Started EgramApplication"
echo - Wait for Vite to say "Ready in x ms"
echo - Then open your browser to the Frontend URL (usually http://localhost:3000 or http://localhost:3001)
echo.
pause
