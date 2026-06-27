# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-24

### Added
- Phase 6 Assessment & Certificate Engine.
- Global exception handling (`NoHandlerFoundException` converted to 404).
- TanStack React Query global provider setup.
- Reels integration in Courses flow.

### Changed
- Dashboard Hero layout to track student progress natively.
- Removed legacy `/api/assessments` routes, UI components, and services.
- Dashboard quick access links refactored for correct routing.
- Repository structure cleaned up and documented (moved test scripts, generated docs structure).

### Removed
- Placeholder UI (AIHub, Events, Projects, Sarathi AI).
- Temporary dev routes from `AppRouter.jsx`.
- Unused development artifacts (`RegexTest.java`).

## [1.0.0] - 2026-06-15

### Added
- Initial Release of Egram Platform.
- Core Course and Topic Module infrastructure.
- User Authentication (JWT) and RBAC (Admin vs. Student).
- Admin Dashboard for content management.
- Backend services using Spring Boot and Postgres.
- Frontend React SPA using Vite and TailwindCSS.
