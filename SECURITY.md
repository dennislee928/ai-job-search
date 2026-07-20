# Security Policy

## Reporting a vulnerability

Please report security findings privately via **[GitHub private vulnerability reporting](https://github.com/MadsLorentzen/ai-job-search/security/advisories/new)** rather than a public issue. You will get a response within a few days, credit in the fix unless you prefer otherwise, and public disclosure coordinated with the patch.

If the private form is unavailable, open a public issue that describes the *class* of problem without a working recipe, and note that you have details to share privately.

## Threat model & Microservice Architecture

The AI Job Search platform runs on a containerized microservice architecture. To ensure maximum data privacy and system security, we have implemented the following hard boundaries:

- **Casbin RBAC (Role-Based Access Control)**: The Go `api-gateway` uses a robust Casbin authorization middleware (`internal/middleware/auth.go`). Every request is verified against strict Casbin rules to ensure that API endpoints (like those that access user data) can only be invoked by authorized roles.
- **Isolated Object Storage**: Resumes and cover letters are no longer processed directly on the local filesystem. They are securely uploaded to a dedicated **MinIO** S3-compatible container. The backend services only stream these files when requested by authorized users.
- **Network Isolation**: The `docker-compose.yml` creates a secure internal docker network. The `postgres`, `minio`, `qdrant`, and `neo4j` databases are NOT exposed to the host machine's public ports by default. They can only be accessed by the backend microservices.
- **Untrusted-input rules**: AI Agents (`/apply` and `/rank`) treat posting text as data, never instructions. Agents are told not to follow directions embedded in postings and not to fetch URLs found inside posting text.

Instruction-level defenses combined with the new microservices architecture raise the security bar significantly. 

Instruction-level defenses raise the bar; they are not a sandbox. If you run this workflow against job boards you do not trust at all, review what the agent fetched and wrote before sending anything out.

## Scope notes

- Portal CLI skills make live requests only when you run them; CI never does.
- Community fork skills listed in the [forks index](https://github.com/MadsLorentzen/ai-job-search/discussions/78) are **not** covered by this policy - review the code you copy, as the index itself says.
