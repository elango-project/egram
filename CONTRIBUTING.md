# Contributing to Egram

Thank you for your interest in contributing to Egram! We welcome contributions to make the platform better.

## Project Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elango-project/egram.git
   cd egram
   ```

2. **Backend Setup:**
   Navigate to the `backend/` directory. Ensure you have Java 21 and Maven installed.
   Create your local Postgres database.
   Copy `.env.example` to `.env` and fill in your DB credentials.
   Run the backend:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

3. **Frontend Setup:**
   Navigate to the `frontend/` directory. Ensure you have Node.js 18+ installed.
   Copy `.env.example` to `.env` and point `VITE_API_BASE_URL` to your backend.
   Run the frontend:
   ```bash
   npm install
   npm run dev
   ```

## Branch Naming Conventions

Please use descriptive branch names based on the type of work:
- `feature/<feature-name>` for new features
- `fix/<bug-name>` for bug fixes
- `docs/<doc-name>` for documentation updates
- `chore/<chore-name>` for maintenance tasks

## Commit Conventions

We follow Conventional Commits. A standard commit message looks like:
```
<type>: <subject>

<body>
```
**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Coding Standards

- **Java:** Follow standard Spring Boot practices. Keep business logic in Services. Ensure proper separation of concerns with Controllers, Services, and Repositories. Use `EgramException` for custom error handling.
- **React/JS:** Use functional components and hooks. Prettier is configured for code formatting. Avoid `window.location.href` for internal routing; use `react-router-dom`'s `useNavigate` or `<Link>`.

## Pull Requests

1. Fork the repository and create your branch from `main`.
2. Ensure you have tested your changes locally.
3. If adding a new feature, update the relevant `docs/` and `CHANGELOG.md`.
4. Open a Pull Request detailing the changes and linking any relevant issues.
5. Wait for a code review from maintainers before merging.
