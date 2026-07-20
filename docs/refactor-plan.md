# Architecture Refactoring Plan

## 1. Overview
This document outlines the strategic plan to refactor the current AI Job Search application from a lightweight script-based architecture into a scalable, multi-language, microservices-oriented platform. 

## 2. Tech Stack Transformation

| Category | Current Stack | Target Stack |
| :--- | :--- | :--- |
| **Languages** | TypeScript, Python, TeX/LaTeX, JavaScript | TypeScript, Python, TeX/LaTeX, JavaScript, **Go**, **Julia** |
| **Frameworks** | *None / Custom* | **Next.js**, **Go-Gin**, **FastAPI** |
| **Infrastructure**| *Local Filesystem* | **PostgreSQL**, **MinIO**, **Redis**, **Qdrant**, **Neo4j** (graph DB), **Google OAuth2**, **Dockerfiles** |
| **AI / Agents** | Claude Code, Custom Skills | Claude Code, Custom Skills, **Codex**, **Gemini**, **OpenRouter**, **Groq**, **Ollama** |
| **Runtime/Tools** | Bun, Python 3, GitHub CLI | **Deno.js (Turbo)**, Python 3, GitHub CLI |
| **Doc Engine** | LuaLaTeX, XeLaTeX, moderncv, pdftotext | XeLaTeX, moderncv, pdftotext *(LuaLaTeX deprecated)* |

## 3. Target Architecture Vision

The new architecture embraces a polyglot microservices model:
*   **Frontend (Next.js)**: A robust web application using React/Next.js, authenticated via Google OAuth2, served by Deno runtime using Turbo for build speed.
*   **API Gateway & Core Backend (Go-Gin)**: High-performance, concurrent API serving as the main proxy and router. It handles core application logic, database interactions, and routes requests to the AI and Data microservices.
*   **AI Microservice (FastAPI)**: Python-based FastAPI service to manage AI orchestration, job scraping, and natural language processing.
*   **Data Microservice (Julia)**: Dedicated Julia-based service for heavy data processing, aggregations, analytics, and complex mathematical/graph computations.
*   **Infrastructure (Dockerized)**: 
    *   **PostgreSQL**: Primary relational datastore (users, job listings, application status).
    *   **Redis**: Caching layer for frequent queries and rate-limiting.
    *   **Qdrant**: Vector database for semantic search of CVs, job descriptions, and skills matching.
    *   **Neo4j**: Graph database to map relationships between skills, job roles, and companies.
    *   **MinIO**: S3-compatible object storage for resumes (PDFs), generated documents, and assets.
*   **AI Engine Layer**: Abstraction layer allowing dynamic routing between local (Ollama) and cloud models (Gemini, Claude, Groq, OpenRouter, Codex) depending on the task's complexity and cost.

## 4. Refactoring Phases

### Phase 1: Infrastructure & Environment (Dockerization)
1.  Initialize `docker-compose.yml` and `Dockerfiles` to orchestrate PostgreSQL, Redis, Qdrant, MinIO, and Neo4j.
2.  Set up volume mounts and network bridges for inter-container communication.
3.  Establish base Dockerfiles for Next.js, Go-Gin, FastAPI, and Julia services.

### Phase 2: Runtime & Tooling Migration
1.  Migrate package management and runtime from Bun to Deno.js.
2.  Set up Turborepo (or equivalent monorepo tooling compatible with Deno) for workspace management.
3.  Ensure Python 3 environment is properly isolated (e.g., using `uv` or `poetry`) for FastAPI.

### Phase 3: Backend Services Construction
1.  **Go-Gin Service**: Scaffold the primary API gateway to act as the main router and proxy to other services. Establish PostgreSQL connections and implement Google OAuth2 logic.
2.  **FastAPI Service**: Scaffold the AI abstraction service. Connect it to Qdrant for vector embeddings and Redis for caching LLM responses. Implement connections to the varied AI providers (Gemini, Groq, Ollama, OpenRouter, Codex).
3.  **Julia Service**: Scaffold the dedicated data processing and analytics microservice for heavy computational tasks.

### Phase 4: Frontend Development
1.  Scaffold a Next.js application in the monorepo.
2.  Implement authentication flows utilizing Google OAuth2.
3.  Build UI components to visualize job matches, interact with AI agents, and manage documents.

### Phase 5: Data & Document Pipeline Refactoring
1.  Standardize document generation strictly on `XeLaTeX` and `moderncv`. Remove `LuaLaTeX` dependencies.
2.  Integrate MinIO for storing parsed text and generated PDFs.
3.  Implement data pipelines (potentially leveraging Julia for heavy aggregation) to sync relational data (Postgres), semantic data (Qdrant), and relational graphs (Neo4j).

## 5. Next Steps
*   Review and approve this architectural plan.
*   Begin Phase 1 by creating the Dockerfiles and docker-compose configurations.
