# Educationgram 🎓
**A Full-Stack EdTech Platform**

Educationgram is a modern, full-stack educational platform designed to deliver an engaging learning experience through both long-form courses and short-form "Reels" content. Built with a robust Spring Boot backend and a dynamic React frontend, it features role-based access control, interactive assessments, a dedicated job portal, and advanced video tracking.

## 🚀 Live Demo
- **Frontend:** [https://egram-frontend.vercel.app] *[Update with real URL]*
- **Backend API:** [https://egram-backend.onrender.com/api/swagger-ui.html] *[Update with real URL]*

### Demo Accounts
You can test the platform using the following pre-seeded demo accounts:
* **Admin:** `admin@egram.com` (Password: `Password@123`)
* **Student:** `student@egram.com` (Password: `Password@123`)

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS (optional/custom CSS), Context API
* **Backend:** Java 21, Spring Boot 3.3, Spring Security (JWT), Hibernate/JPA
* **Database:** PostgreSQL (Neon Serverless)
* **Media Storage:** Cloudinary
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## ✨ Key Features
1. **Short-form & Long-form Content**
   * TikTok/Instagram-style "Reels" for quick learning concepts.
   * Comprehensive multi-module video courses.
   * Automated video progress tracking (Resume from where you left off).
2. **Course Management & Certification**
   * Admins can create and manage courses with rich descriptions and thumbnails.
   * Students enroll, track progress, and complete modules.
3. **Assessments & Analytics**
   * Time-bound online assessments for courses.
   * Instant grading, attempt history, and analytics tracking (Pass rates, average scores).
4. **Job Portal & Application Tracking**
   * Built-in job/internship board with filtering (Remote, Onsite, Hybrid).
   * Resume and Cover Letter submissions.
   * Real-time application status tracking (Pending -> Shortlisted -> Selected).
5. **Role-Based Access Control (RBAC)**
   * Secure JWT authentication separating `ADMIN` and `STUDENT` privileges.

---

## 🏗️ Architecture
The application follows a standard multi-tier REST API architecture:
1. **Client Layer:** React SPA deployed on Vercel.
2. **API Layer:** Spring Boot REST Controllers secured with stateless JWT filters.
3. **Service Layer:** Business logic handling N+1 optimizations, analytics aggregation, and entity mapping.
4. **Data Layer:** Spring Data JPA interfacing with a fully managed PostgreSQL database on Neon.

---

## 💻 Local Development Setup

### Prerequisites
* Java 21+
* Node.js 18+
* PostgreSQL database (Local or Neon)
* Cloudinary Account

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Copy the example environment file: `cp .env.example .env`
3. Fill in your PostgreSQL and JWT secrets in `.env`.
4. Run the application:
   ```bash
   mvn clean spring-boot:run
   ```
   *The API will be available at `http://localhost:8080/api`*

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *The UI will be available at `http://localhost:5173`*

---

## 🛡️ API Documentation
Once the backend is running, the interactive Swagger OpenAPI documentation is accessible at:
* **Local:** `http://localhost:8080/api/swagger-ui.html`
* **Production:** `<your-render-url>/api/swagger-ui.html`
