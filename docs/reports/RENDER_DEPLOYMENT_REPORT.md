# Render Backend Deployment Report
**Deployment Status:** `READY_TO_DEPLOY`

## Phase 13A - Pre-Deployment Audit Summary
The `backend` module was thoroughly reviewed to ensure it is safe and stable for a live Render deployment:
- **pom.xml:** Validated. Output artifact is `egram-backend-1.0.0-SNAPSHOT.jar`.
- **application.properties:** Configured for production. Destructive schema operations are mitigated via `spring.jpa.hibernate.ddl-auto=${DDL_AUTO:validate}`.
- **SecurityConfig:** Validated. Public endpoints (`/health`, `/auth/register`, `/auth/login`, Swagger) are correctly configured as `permitAll()`. CORS allows the dynamic `FRONTEND_URL`.
- **JwtService:** Validated. No hardcoded keys; secrets strictly loaded via environment variable configuration.
- **AdminSeeder:** Validated. Seeding is conditionally gated behind the `SEED_ADMIN` flag, preventing unintended data overwrites in production.
- **Environment Variables:** All secrets have been decoupled from the codebase and are safely injected at runtime.

## Phase 13B & 13C - Render Configuration
When setting up your **Web Service** on Render, use the exact configuration below.

### Web Service Settings
* **Service Type:** Web Service
* **Runtime:** Java
* **Branch:** `main`
* **Root Directory:** `backend`
* **Build Command:** `mvn clean package -DskipTests`
* **Start Command:** `java -jar target/egram-backend-1.0.0-SNAPSHOT.jar`

### Environment Variables
Inject the following variables into the Render dashboard (under Advanced -> Environment Variables):

| Key | Value / Example | Notes |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:postgresql://<neon-host>/neondb?sslmode=require&channel_binding=require` | Your exact Neon DB connection string. |
| `DB_USERNAME` | `<neon-user>` |  |
| `DB_PASSWORD` | `<neon-password>` | Ensure you use the newly rotated password. |
| `JWT_SECRET` | `<32-character-random-string>` | Must be at least 32 characters long. |
| `DDL_AUTO` | `update` *(for first run)* | **Important:** Set to `update` just for the first deployment so Hibernate generates your tables. After it succeeds, change this to `validate` and restart. |
| `FRONTEND_URL` | `https://<your-vercel-domain>.vercel.app` | Leave blank until Vercel is deployed, then add it here to enable CORS. |
| `SEED_ADMIN` | `true` | Set to `true` for the first run to create the demo accounts, then change to `false`. |
| `LOG_LEVEL` | `INFO` | Standard production logging level. |

## Phase 13D & 13E - Startup & Validation Results
We ran a rigorous simulated Render startup sequence locally matching the production environment injection. 
* **Startup:** `Tomcat started on port 8080 (http)`. The context loaded successfully without dependency injection failures.
* **Hibernate:** Successfully validated schema constraints and initiated connection pooling (HikariCP) against the remote Neon instance.
* **Health Endpoint:** `GET /api/health` returned `HTTP 200 OK` (Status: UP).
* **Authentication:** `POST /api/auth/login` successfully authenticated the demo user and returned a valid JWT token.

## Next Steps
1. Navigate to [Render Dashboard](https://dashboard.render.com).
2. Create a new Web Service using the configurations above.
3. Once the build finishes and goes live, navigate to `https://<your-render-url>.onrender.com/api/swagger-ui.html` to confirm functionality.
4. Proceed to Phase 13C (Deploying the Frontend to Vercel).
