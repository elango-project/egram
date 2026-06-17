# Egram MVP - AI Learning Platform

Egram is an AI-powered learning ecosystem built with a robust Spring Boot 3 backend and a responsive React frontend.

## Features
- **Role-Based Access**: Secure login/registration for `STUDENT` and `ADMIN` roles using JWT.
- **Reals**: Short-form educational video content with likes, saves, and comments.
- **Videos**: Long-form structured video content.
- **Courses**: Modular courses with enrollments and progress tracking.
- **Assessments**: Timed quizzes with automated scoring.
- **Jobs & Internships**: Browse and apply for opportunities.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.3.0, Spring Security (JWT), Spring Data JPA.
- **Database**: PostgreSQL (Neon Serverless DB).
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, React Hot Toast.

## Local Setup

### Database (Neon Setup)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech).
2. Copy the connection string.

### Backend Setup
1. Navigate to the `backend` directory.
2. In `src/main/resources/application.properties`, update the database credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://<NEON_URL>?sslmode=require
   spring.datasource.username=<YOUR_USERNAME>
   spring.datasource.password=<YOUR_PASSWORD>
   jwt.secret=<YOUR_256_BIT_SECRET_KEY>
   ```
3. Run `mvn clean compile` then start the application using `mvn spring-boot:run`. The backend runs on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Run `npm install`.
4. Run `npm run dev`. The frontend runs on `http://localhost:5173`.

---

## Deployment Configuration & Checklists

### Backend (Render Deployment)
To deploy the Spring Boot backend on Render:
1. Create a **Web Service** on Render connected to your repository.
2. Build Command: `./mvnw clean package -DskipTests`
3. Start Command: `java -jar target/egram-backend-1.0.0-SNAPSHOT.jar`
4. Set the following **Environment Variables**:
   - `DB_URL` = `jdbc:postgresql://<NEON_HOST>/<DB_NAME>?sslmode=require`
   - `DB_USERNAME` = `your_neon_username`
   - `DB_PASSWORD` = `your_neon_password`
   - `JWT_SECRET` = `your_generated_jwt_secret`
5. **Important**: Once deployed, copy your Render URL (e.g., `https://egram-api.onrender.com`).

### Frontend (Vercel Deployment)
To deploy the React application on Vercel:
1. **Pre-requisite**: In the backend source code (`SecurityConfig.java`), replace `YOUR_VERCEL_APP_NAME` with the exact Vercel domain you intend to use. Commit and push this change so the backend accepts CORS requests from Vercel.
2. Connect your repository to Vercel and import the `frontend` folder.
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set the following **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://egram-api.onrender.com/api` (Replace with your actual Render backend URL)

---

## Smoke-Test Checklist

After deployment, perform these manual tests to verify everything is working.

### Admin Tests
- [ ] Login as an ADMIN user.
- [ ] Create a Real (verify thumbnail, url, description).
- [ ] Create a Long-form Video.
- [ ] Create a Course and add a Module (linking the created Real or Video).
- [ ] Create an Assessment and add 2 Questions.
- [ ] Create a Job posting.

### Student Tests
- [ ] Register a new STUDENT account.
- [ ] Login to the new account.
- [ ] View the created Real, Like it, and Save it.
- [ ] View the Long-form Video.
- [ ] Enroll in the created Course.
- [ ] Take the Assessment and verify the score calculates correctly.
- [ ] Apply to the Job posting.
