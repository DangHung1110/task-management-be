# Task Management Backend

Backend API for a Kanban-style task management system. The project supports authentication, workspace collaboration, board/list/card management, scoped permissions, soft delete flows, seed data, and Swagger/OpenAPI documentation.

## Tech Stack

- Node.js, TypeScript, Express
- PostgreSQL, TypeORM
- JWT, Passport Google/Facebook OAuth, express-session
- Zod, class-validator, Swagger/OpenAPI
- Docker, Jest

## Main Features

- **Authentication**: register, login, refresh token, logout, Google/Facebook OAuth, email verification, OTP password reset.
- **Users and roles**: user management, admin/user roles, RBAC seed data, permission middleware.
- **Workspaces**: create, list, detail, update, soft delete, hard delete, restore.
- **Workspace members**: invite members, accept invitations, manage workspace access.
- **Boards**: create boards inside workspaces, list/detail/update boards, delete/restore boards, board-level permission checks.
- **Lists**: create/update/delete lists, restore lists, swap list positions.
- **Cards**: create/update/delete cards, restore cards, swap card positions, check list/board access before card actions.
- **API documentation**: OpenAPI registries are generated from module routers and exposed through Swagger.

## Architecture

The codebase is organized by feature modules under `src/modules`. Each module follows a layered structure:

```text
router -> controller -> service -> repository -> TypeORM entities
```

- **Router**: defines API routes, validation schemas, Swagger metadata, authentication, and permission middleware.
- **Controller**: handles HTTP request/response mapping.
- **Service**: contains business logic and coordinates repositories.
- **Repository**: encapsulates database access through TypeORM.
- **Entities**: define PostgreSQL tables and relationships.

Shared infrastructure lives under `src/common`, including response DTOs, exception handling, validation, auth middleware, permission checks, pagination utilities, and request context helpers. Configuration and seeders live under `src/config`.

## Project Structure

```text
src/
  common/        shared DTOs, middlewares, exceptions, utilities
  config/        app, database, mail, passport, and seed config
  entities/      TypeORM entities
  modules/       feature modules: auth, user, workspaces, boards, lists, cards
  swagger/       OpenAPI document generation and Swagger router
  main.ts        Express app bootstrap
```

## Getting Started

Install dependencies:

```bash
yarn install
```

Create an `.env` file with the required values:

```env
NODE_ENV=development
HOST=localhost
PORT=4411
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=dev_session_secret

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=task_db

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
FE_URL=http://localhost:5173
```

Run the API:

```bash
yarn dev
```

Run with Docker:

```bash
docker compose up --build
```

Run seeders:

```bash
yarn seed
```

Run tests:

```bash
yarn test
```

## Notes

- TypeORM currently uses `synchronize: true`, so database schema is generated from entities in development.
- The application runs seeders during startup to prepare roles, permissions, admin user, and existing user verification data.
- Swagger documentation is available after the server starts through the configured OpenAPI route.
