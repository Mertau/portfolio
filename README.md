# Portfolio — Over-Engineered Personal Showcase

A production-grade personal portfolio website built with a multi-agent engineering approach. Demonstrates advanced full-stack architecture, real-time WebSocket features, and security-hardened deployment.

## Architecture

```
Frontend (Next.js 15)  →  FastAPI Backend  →  PostgreSQL + Redis
         ↓                       ↓
    Framer Motion           WebSocket Service
    D3.js + Three.js        JWT Auth + RBAC
    NextAuth.js             Rate Limiting
         ↓
    AWS Fargate / ECS  →  CloudFront CDN
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Framer Motion, Tailwind CSS |
| Backend | FastAPI, Python 3.11, SQLAlchemy, Pydantic |
| Database | PostgreSQL 15 (RDS), Redis 7 (ElastiCache) |
| Auth | NextAuth.js, JWT (RS256), OAuth2 (Google, GitHub) |
| Realtime | WebSocket, Redis Pub/Sub |
| DevOps | Docker, GitHub Actions, AWS ECS Fargate |
| Security | OWASP Top 10, bcrypt, CORS, CSP, Rate Limiting |

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Quick Start

```bash
# Clone and start all services
git clone <repo-url>
cd portfolio

# Start with Docker Compose
docker-compose up --build

# OR start manually:

# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Environment Setup

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/portfolio
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=<generate with: openssl rand -hex 32>
ENVIRONMENT=development
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>
GITHUB_CLIENT_ID=<your github oauth app id>
GITHUB_CLIENT_SECRET=<your github oauth app secret>
```

### Seed Database

```bash
cd backend
python -m app.services.seed
```

## API Documentation

With `DEBUG=true`, visit `http://localhost:8000/docs` for interactive Swagger UI.

Key endpoints:
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login, receive JWT
- `GET /api/v1/projects` — List all projects
- `GET /api/v1/blog` — List blog posts
- `POST /api/v1/contact` — Submit contact form
- `WS /api/v1/ws/metrics` — Real-time system metrics stream
- `WS /api/v1/ws/algorithms` — Algorithm visualization stream

## Real-Time Visualizer

Navigate to `/visualizer` to see:
- **System Metrics**: Live CPU, memory, and disk utilization via WebSocket
- **Algorithm Visualization**: Step-by-step sorting (Bubble Sort, Selection Sort) with color-coded bar charts

Authentication required — sign in at `/auth/signin` first.

## Deployment

### CI/CD Pipeline (GitHub Actions)

Triggered on `push` to `main`:
1. Frontend CI (type-check, lint, build)
2. Backend CI (flake8, mypy, pytest)
3. Security scan (Trivy, OWASP Dependency Check)
4. Docker build + push to AWS ECR
5. ECS Fargate rolling deployment

### AWS Setup

1. Create ECR repositories: `portfolio-backend`, `portfolio-frontend`
2. Set up ECS cluster `portfolio-cluster` with Fargate
3. Provision RDS PostgreSQL (db.t3.micro) and ElastiCache Redis
4. Configure Secrets Manager with database URL, Redis URL, JWT key
5. Set GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
6. Update `ACCOUNT_ID` in `infra/ecs-task-definition.json`

## Security

- JWT with 15-minute access tokens + 7-day refresh tokens (HttpOnly cookies)
- bcrypt password hashing (cost factor 12)
- Sliding window rate limiting (Redis-backed)
- Account lockout after 5 failed attempts
- OWASP Top 10 mitigations implemented
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- CORS strict origin whitelist

## Multi-Agent Development

This project was built using a three-agent model:
- **Agent Alpha** (Frontend): Next.js 15, Framer Motion, Bento layouts, D3.js/Three.js
- **Agent Beta** (Backend/DevOps): FastAPI, PostgreSQL, Docker, GitHub Actions, AWS ECS
- **Agent Gamma** (Security): OWASP hardening, JWT security, rate limiting, penetration testing
