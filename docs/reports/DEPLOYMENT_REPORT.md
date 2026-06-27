# Phase 13 Deployment Report
**Status:** `BLOCKED` (Pending Live URL Smoke Testing by Owner)

## Phase 13A - Pre-Deployment Audit
**Status:** PASS
* `application.properties` uses `spring.jpa.hibernate.ddl-auto=${DDL_AUTO:validate}` to prevent destructive schema updates in production.
* `SecurityConfig.java` has been updated to dynamically read the CORS allowed origin via the `FRONTEND_URL` environment variable.
* All hardcoded database credentials and JWT secrets have been scrubbed from `.env.example` and the codebase.
* `.gitignore` has been hardened to prevent `.env`, `.env.local`, and `*.secret` from being committed.
* `AdminSeeder` is secured behind the `SEED_ADMIN` flag and defaults to `false`.

## Phase 13B - Backend Deployment (Render)
**Root Directory:** `backend`
**Build Command:** `mvn clean package -DskipTests`
**Start Command:** `java -jar target/egram-backend-1.0.0-SNAPSHOT.jar`

### Required Environment Variables:
```env
DB_URL=jdbc:postgresql://<neon-url>/neondb?sslmode=require&channel_binding=require
DB_USERNAME=<neon-user>
DB_PASSWORD=<neon-password>
JWT_SECRET=<min-32-char-random-string>
DDL_AUTO=validate
FRONTEND_URL=https://<your-vercel-domain>.vercel.app
SEED_ADMIN=false
LOG_LEVEL=INFO
```
*Note: Set `SEED_ADMIN=true` on the very first start to generate demo accounts, then switch to `false` and restart.*

## Phase 13C - Frontend Deployment (Vercel)
**Root Directory:** `frontend`
**Framework:** `Vite`

### Required Environment Variables:
```env
VITE_API_URL=https://<your-render-domain>.onrender.com/api
```

> [!TIP]
> A `vercel.json` file has been added to the `frontend` directory containing standard rewrite rules. This is **critical** and ensures that React Router works correctly when a user refreshes the page on Vercel.

## Phase 13D - Production Smoke Testing
**Status:** PENDING

*Please run through the following checklist on your live URLs before sharing the project.*

- [ ] **Admin Flow:** Login (`admin@egram.com`), Create Reel, Create Video, Create Course, Create Assessment, Create Job.
- [ ] **Student Flow:** Register/Login, Watch Reel, Watch Video, Enroll Course, Complete Course, Take Assessment, Apply Job.
- [ ] **Validation Checks:**
  - JWT persists across browser refreshes.
  - Role permissions strictly enforced (Students get 403 on Admin routes).
  - CORS blocks unauthorized domains but allows your Vercel app.
  - Data correctly persists to the Neon database.
  - React Router handles page refreshes without throwing a Vercel 404 error.

## Phase 13E - Production Security Review
**Status:** ACTION REQUIRED
- [x] No secrets exist in the active working tree.
- [x] JWT expiration is configured (24 hours).
- [x] Passwords are encrypted using BCrypt.
- [x] Admin endpoints are strictly protected by `@PreAuthorize("hasRole('ADMIN')")`.
- [ ] **WARNING:** Git history contains previous commits with exposed secrets. The database password and JWT secrets **must be rotated** before going live.

## Phase 13F - Final Assessment
The repository code is fully production-ready, but the deployment status is currently **BLOCKED** until:
1. The Neon Database password is rotated.
2. The infrastructure is manually provisioned on Render and Vercel.
3. The Phase 13D Smoke Test is executed on the live URLs.
