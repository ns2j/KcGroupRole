# KcOidc - Full-Stack OIDC & BFF Monorepo

Welcome to the **KcOidc** monorepo! This project demonstrates a robust, modern full-stack architecture utilizing **Keycloak** for OpenID Connect (OIDC) authentication, a **Backend-For-Frontend (BFF)** pattern for secure session management, and an advanced **AST-based Authorization Engine**.

## 🏗️ Architecture Overview

The system is designed with security and scalability in mind, splitting responsibilities across dedicated microservices and frontend clients.

### Repository Structure

- **[`apps/backend`](./apps/backend)**
  - **Framework**: Spring Boot (Java)
  - **Role**: Resource Server / API
  - **Description**: Exposes protected REST API endpoints. Validates access tokens and enforces endpoint-level authorities.
  
- **[`apps/bff`](./apps/bff)**
  - **Framework**: Node.js & Express
  - **Role**: Backend-For-Frontend / Token Manager
  - **Description**: Handles the OAuth2/OIDC flow with Keycloak. Issues secure, HTTP-only session cookies to frontends, securely stores raw JWTs, and proxies API requests to the Spring Boot backend. Features an advanced **AST Policy Engine** for complex Role-Based Access Control (RBAC) and group permissions.

- **[`apps/web`](./apps/web)**
  - **Framework**: Next.js (App Router) & Tailwind CSS v4
  - **Role**: Web Frontend
  - **Description**: A modern React application that consumes the BFF. It relies entirely on secure session cookies, keeping sensitive tokens out of the browser.

- **[`apps/mobile`](./apps/mobile)**
  - **Framework**: Flutter
  - **Role**: Mobile Frontend
  - **Description**: Cross-platform mobile (Android/iOS) authentication and API consumption, synchronizing securely with the BFF using native app links and custom URI schemes.

- **[`apps/packages`](./apps/packages)**
  - **Role**: Shared Code
  - **Description**: Cross-application shared libraries and TypeScript definitions (e.g., `api-types.d.ts`) to ensure structural consistency across the Node.js BFF and Next.js frontend.

## 🔐 Security Concepts

1. **BFF Pattern**: Frontends (Web & Mobile) never handle raw JWT access or refresh tokens. Instead, the BFF manages the Keycloak dance and binds the tokens to an encrypted server-side session, issuing an HTTP-Only cookie to the client.
2. **AST-Based Authorization**: Moving beyond simple RBAC, the BFF uses an Abstract Syntax Tree (AST) policy engine to evaluate complex combinations of roles and groups (e.g., `hasRole('manager') AND isInGroup('/A/B')`) before proxying requests to the backend.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- JDK 21 or higher (for Backend development)
- Node.js 20+ (for BFF and Web development)
- Flutter SDK (for Mobile development)

### Running via Docker Compose

The easiest way to orchestrate the entire stack (Backend, BFF, and Web) is using Docker Compose:

```bash
docker-compose up --build
```

- **Next.js Web UI**: `http://localhost:3000`
- **Express BFF**: `http://localhost:8020`
- **Spring Boot API**: `http://localhost:8010`

### Local Development (Without Docker)

If you are developing locally with live-reloading:

1. **Start the Backend**:
   ```bash
   cd apps/backend
   ./gradlew bootRun
   ```
2. **Start the BFF**:
   ```bash
   cd apps/bff
   npm run dev
   ```
3. **Start the Web App**:
   ```bash
   cd apps/web
   npm run dev
   ```

> **Note on Local Development**: When developing locally, especially when integrating with mobile or crossing device boundaries, it is highly recommended to use your machine's local IP address (e.g., `http://192.168.x.x:3000`) instead of `localhost` to avoid cross-domain Cookie restrictions and CORS issues.

## 📝 Configuration

Environment variables are managed using `dotenv-flow`.
Create `.env.local` files in the respective `apps/` directories to override defaults.

---
_Built with ❤️ using Spring Boot, Next.js, Express, and Flutter._
