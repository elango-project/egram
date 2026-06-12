# Educationgram (Egram)

> **AI-powered Academia-Industry Ecosystem** — a portfolio-grade full-stack MVP combining learning, mentorship, internships, AI guidance, and event discovery.

---

## 🏗️ Architecture

```
React + Tailwind  →  Spring Boot REST API  →  PostgreSQL
                            ↓
                   Python FastAPI (Gemini AI)
                            ↓
                          Redis
```

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite |
| Backend | Java 21, Spring Boot 3.3, Spring Security |
| Auth | JWT (jjwt 0.12), BCrypt |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI Service | Python 3.13, FastAPI, Google Gemini API |
| PDF | ReportLab |
| QR Code | ZXing (Java) |
| Container | Docker Compose |

---

## 📁 Project Structure

```
egram/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/egram/
│       ├── auth/         # JWT auth (register, login, refresh)
│       ├── user/         # User profiles & roles
│       ├── course/       # Courses, modules, videos, enrollment
│       ├── reel/         # Educational reels
│       ├── internship/   # Internship & job portal
│       ├── event/        # Event hub
│       ├── mentor/       # Mentor marketplace
│       ├── creator/      # Verified creator ecosystem
│       ├── certificate/  # QR + SHA-256 verification
│       ├── skill/        # Skill passport & analytics
│       ├── project/      # Project showcase
│       ├── parent/       # Parent dashboard
│       └── config/       # Security, OpenAPI, JPA
│
├── ai-service/       # Python FastAPI AI microservice
│   └── app/
│       ├── routers/
│       │   ├── mentor.py   # Sarathi AI Mentor
│       │   ├── video.py    # Video Summary & Q&A
│       │   └── resume.py   # AI Resume Builder
│       └── gemini_client.py
│
├── frontend/         # React + Tailwind SPA
│   └── src/
│       ├── pages/    # All page components
│       ├── components/ # Layout, common components
│       ├── api/      # Axios client
│       └── store/    # Zustand state
│
├── docker-compose.yml
└── .env.example
```

---

## ⚡ Quick Start

### Prerequisites
- Java 21, Maven 3.9
- Node.js 18+
- Python 3.13
- Docker Desktop

### 1. Clone & Setup Environment
```bash
git clone https://github.com/your-username/egram.git
cd egram
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Start with Docker Compose
```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| AI Service | http://localhost:8001 |
| AI Docs | http://localhost:8001/docs |

### 3. Run Locally (Dev Mode)

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔑 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/users/me` | Current user profile |
| GET  | `/api/courses` | List courses |
| POST | `/api/courses/{id}/enroll` | Enroll in course |
| GET  | `/api/reels` | Reel feed |
| POST | `/api/ai/mentor` | Sarathi AI chat |
| POST | `/api/ai/mentor/mock-interview` | Mock interview |
| POST | `/api/ai/video/summary` | Video summary |
| POST | `/api/ai/video/qna` | Video Q&A |
| POST | `/api/ai/resume` | Generate resume |
| GET  | `/api/internships` | Internship listings |
| GET  | `/api/events` | Event hub |
| POST | `/api/creators/apply` | Apply for creator verification |

Full API docs: `http://localhost:8080/api/swagger-ui.html`

---

## 🧩 User Roles

| Role | Description |
|---|---|
| `STUDENT` | Learn, apply, use AI features |
| `MENTOR` | Offer mentorship services |
| `FACULTY` | Monitor students, verify internships |
| `PARENT` | View linked student progress |
| `ADMIN` | Full platform management |
| `VERIFIED_CREATOR` | Upload courses, reels, workshops |

---

## 🤖 AI Features

- **Sarathi AI Mentor** – Career guidance, interview prep, technical Q&A (Gemini)
- **AI Video Summary** – Instant key takeaways and notes from any video
- **AI Resume Builder** – ATS-optimised PDF resume generation
- **AI Mock Interview** – Role-specific interview question generator
- **AI Event Recommendations** – Smart event suggestions based on skill profile

---

## 🛡️ Security

- JWT Bearer tokens (access + refresh)
- BCrypt password hashing
- Spring Security role-based access control
- CORS configured for dev and production

---

## 📄 License

MIT
