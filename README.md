# Egram

## 1 Introduction
Egram is a professional, modern EdTech platform designed for comprehensive learning, skill development, and career placement. Built with a premium aesthetic and seamless user experience in mind, it provides robust capabilities for course management, short-form educational videos (Reels), job applications, and career tracking.

## 2 Features
- **Hierarchical Learning:** Course → Module → Topic → Assessment → Certificate.
- **Short-form Learning:** Integrated Reels for micro-learning and quick skill acquisition.
- **Career Hub:** Dedicated sections for Jobs, Internships, and Placement tracking.
- **Role-Based Access Control:** Separate flows for Students and Admins.
- **Modern UI:** Premium design with Framer Motion animations, Lucide icons, and TailwindCSS.

## 3 Screenshots
*(Screenshots are managed in `docs/screenshots/`)*

## 4 Architecture
Egram uses a decoupled client-server architecture:
- **Backend:** Spring Boot RESTful API handling authentication, authorization, business logic, and database interactions.
- **Frontend:** React Single Page Application (SPA) utilizing Vite for lightning-fast builds and React Router for client-side navigation.
- **Data Layer:** PostgreSQL relational database.

## 5 Folder Structure
```text
egram/
├── backend/            # Spring Boot Java Application
├── frontend/           # React + Vite Application
├── ai-service/         # AI Recommendation Engine (Planned)
├── docs/               # Project documentation
│   ├── api/
│   ├── architecture/
│   ├── archive/
│   ├── guides/
│   ├── implementation/
│   ├── proofs/
│   ├── reports/
│   └── screenshots/
└── scripts/            # Development, testing, and deployment scripts
    ├── admin/
    ├── database/
    ├── powershell/
    └── testing/
```

## 6 Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, TanStack Query, Zustand, Axios
- **Backend:** Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **AI Service:** Python, FastAPI (Planned)
- **Deployment:** Vercel (Frontend), Render (Backend), Supabase (Database)

## 7 Installation
Ensure you have the following installed:
- Node.js (v18+)
- Java 21
- Maven
- PostgreSQL

Clone the repository:
```bash
git clone https://github.com/elango-project/egram.git
cd egram
```

## 8 Running Backend
1. Navigate to the backend directory: `cd backend`
2. Copy the environment template: `cp .env.example .env`
3. Configure your local PostgreSQL credentials in `.env`.
4. Compile and run:
```bash
mvn clean compile
mvn spring-boot:run
```

## 9 Running Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Copy the environment template: `cp .env.example .env`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## 10 Running AI Service
*(The AI Service implementation is slated for Phase 7. Instructions will be updated upon completion.)*

## 11 Docker
A `docker-compose.yml` file is provided in the root directory for easy containerized orchestration of the database and services (if configured). To start:
```bash
docker-compose up -d
```

## 12 API Overview
The backend API exposes resources primarily for:
- `/api/auth` (Login, Register)
- `/api/users` (Profiles, Stats)
- `/api/courses` (Courses, Modules, Topics, Enrollments)
- `/api/reals` (Educational Reels)
- `/api/jobs` / `/api/internships` (Career tracking)

## 13 Deployment
Egram uses CI/CD for automated deployments.
- **Frontend** is deployed to Vercel.
- **Backend** is deployed to Render.
- Deployment scripts and historical reports are located in `scripts/deployment/` and `docs/reports/`.

## 14 Testing
Automated and end-to-end testing scripts are located in `scripts/testing/`.
You can run JavaScript-based tests via Node or PowerShell scripts using the provided tools.

## 15 Roadmap
- **v1.1 (Current):** Full Release Candidate with integrated assessments, course workflows, and layout cleanup.
- **v1.2 (Next):** AI Recommendation Engine integration (AIHub, personalized mentoring).
- **v2.0 (Future):** Real-time chat, Community Events, and Project tracking.

## 16 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
