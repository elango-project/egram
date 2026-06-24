# Egram V1.1 🚀

Egram is a modern, comprehensive EdTech platform designed to bridge the gap between learning and employment. It features a premium, Notion-inspired learning workspace, an ATS-style placement hub, and an advanced administrative control center.

![Egram Cover](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200)

## ✨ Key Features

### 🎓 Student Experience
- **Premium Learning Workspace**: A Coursera-inspired learning environment with split-pane topic views, concept reels, and deep dive videos.
- **Placement Hub**: A LinkedIn-style two-panel interface to browse jobs and internships with 1-click apply and slide-over application drawers.
- **Interactive Assessments**: Real-time quiz builder and assessment tracking to unlock certificates.
- **Gamified Progress**: Visual completion trackers, "watch" simulations for reels and videos, and a comprehensive unified dashboard.

### ⚙️ Admin Control Center
- **Notion-Style Curriculum Builder**: Drag-and-drop course creation, module structuring, and content attachment using `@hello-pangea/dnd`.
- **ATS Dashboard**: Manage incoming applications, jobs, and internships in a sleek, two-panel recruiter interface.
- **Analytics Grid**: Centralized metrics powered by `recharts` to track student engagement, enrollments, and course completion.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM (Lazy Loaded & Suspense)
- **Styling**: Vanilla CSS, Tailwind CSS (Design System)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **HTTP Client**: Axios (with global error interceptors)
- **Toast Notifications**: react-hot-toast
- **Build Tool**: Vite

### Backend (Java/Spring Boot)
- **Framework**: Spring Boot 3
- **Security**: Spring Security + JWT Authentication
- **Database**: MySQL + Hibernate/JPA
- **Architecture**: MVC Pattern (Controllers, Services, Repositories)

## 📦 Project Architecture

```
├── backend/
│   ├── src/main/java/com/egram/
│   │   ├── config/       # Security & CORS configuration
│   │   ├── controllers/  # REST APIs
│   │   ├── models/       # JPA Entities
│   │   ├── repositories/ # Spring Data JPA
│   │   ├── security/     # JWT filters and auth providers
│   │   └── service/      # Business logic and transactions
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance and interceptors
    │   ├── components/   # Reusable UI components (Buttons, Cards)
    │   ├── context/      # React Context (Auth)
    │   ├── pages/        # Route components (Home, Dashboard)
    │   ├── services/     # Frontend API wrappers
    │   ├── theme/        # Global animations and tokens
    │   └── App.jsx       # Root layout & Error Boundary
    └── package.json
```

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v18+)
- Java 17+
- MySQL Server

### 1. Database Setup
Create a MySQL database named `egram_db`:
```sql
CREATE DATABASE egram_db;
```

### 2. Environment Variables

**Backend (`backend/src/main/resources/application.properties`)**:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/egram_db
spring.datasource.username=root
spring.datasource.password=yourpassword
jwt.secret=your_super_secret_key_that_is_long_enough
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
npm run preview
```

## 🛡️ Security & Performance
- **Route Protection**: Strict Role-Based Access Control (RBAC) preventing students from accessing admin panels and vice-versa.
- **Code Splitting**: Routes are dynamically loaded to keep initial bundle size < 300KB.
- **Error Boundaries**: Top-level React error boundaries to prevent app crashes.

---
Built with ❤️ for modern education.
