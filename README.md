<div align="center">

# ⚡ TaskOS

### AI-Powered Productivity Operating System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-task--os--nine.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://task-os-nine.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

**TaskOS** is a full-stack, production-grade productivity platform featuring AI task assistance, habit tracking, team collaboration, gamification, and real-time push notifications — all in a single Next.js application.

</div>

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Authentication Flow](#-authentication-flow)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [AI Features](#-ai-features)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Local Setup](#-local-setup)
- [Deployment](#-deployment)

---

## 🌐 Live Demo

**Production:** [https://task-os-nine.vercel.app](https://task-os-nine.vercel.app)

> Deployed on Vercel (Mumbai region `bom1`) with Neon Serverless PostgreSQL.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Task Coach** | Groq-powered task breakdown, priority suggestions, and streak guardian |
| ✅ **Task Management** | Full CRUD with subtasks, categories, due dates, reminders, and priority scoring |
| 🔥 **Habit Tracker** | Daily habits with streak tracking, completion history, and analytics |
| 📅 **Planner** | Calendar-style event planner with time blocks and reminders |
| 👥 **Groups** | Team workspaces with role-based access (admin/member), leaderboards, and activity feeds |
| 🏆 **Gamification** | XP points, streak badges, levels, and confetti animations |
| 📊 **Analytics** | SVG charts for task completion, habit consistency, and streak performance |
| 🔔 **Push Notifications** | Web Push (VAPID) for task reminders and habit nudges |
| 💳 **Payments** | Razorpay integration for Pro tier upgrades |
| 📷 **Avatar Upload** | AWS S3 presigned URL image uploads |
| 🔐 **Auth** | Email/password + Google OAuth with JWT sessions |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  /tasks  │  │ /habits  │  │ /planner │  │  /analytics  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └─────────────┴─────────────┴────────────────┘           │
│                              │                                  │
│                    React Context (Auth, State)                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │  HTTPS / fetch()
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 15 APP ROUTER (Vercel)                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                      │   │
│  │   JWT Auth Guard │ Rate Limiter │ CORS │ Error Handler   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │
│  │  /api/auth │  │ /api/tasks │  │ /api/ai  │  │/api/groups│  │
│  │  /api/auth │  │ /api/habits│  │  coach   │  │/api/streak│  │
│  └────────────┘  └────────────┘  └──────────┘  └───────────┘  │
│                               │                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DOMAIN SERVICES                       │   │
│  │  AuthService │ TaskService │ HabitService │ AIService    │   │
│  │  GroupService │ StreakService │ NotificationService      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PRISMA ORM  (Repository Layer)              │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                     ▼
  ┌───────────────┐   ┌─────────────────┐  ┌──────────────────┐
  │  Neon Postgres│   │   AWS S3        │  │  External APIs   │
  │  (ap-south-1) │   │ (Avatar Store)  │  │ Groq │ Razorpay  │
  └───────────────┘   └─────────────────┘  │ Resend │ VAPID   │
                                            └──────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5 | Full-stack React framework (App Router) |
| React | 18.3 | UI library |
| TypeScript | 5.7 | Type safety |
| Framer Motion | 11 | Animations & micro-interactions |
| Vanilla CSS | — | Styling (CSS Modules per page) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Next.js API Routes | 15.5 | Serverless REST API |
| Prisma ORM | 5.22 | Type-safe DB access |
| PostgreSQL (Neon) | 16 | Primary database |
| JSON Web Tokens | 9.0 | Stateless auth sessions |
| Zod | 4.4 | Request validation |
| bcryptjs | 3.0 | Password hashing |

### Infrastructure & Services
| Service | Purpose |
|---|---|
| Vercel | Hosting + Serverless Functions (Mumbai region) |
| Neon | Serverless PostgreSQL with connection pooling |
| AWS S3 | User avatar image storage |
| Groq (LLaMA 3) | AI task coaching & suggestions |
| Razorpay | Payment processing (Pro tier) |
| Resend | Transactional email (password reset, OTP) |
| Web Push (VAPID) | Browser push notifications |
| Google OAuth 2.0 | Social authentication |

---

## 🔐 Authentication Flow

### Email / Password Auth

```
User                    Next.js API              Neon DB
 │                          │                       │
 │── POST /api/auth/login ──►│                       │
 │   { email, password }    │                       │
 │                          │── findUnique(email) ──►│
 │                          │◄── user + hash ────────│
 │                          │                       │
 │                          │  bcrypt.compare()      │
 │                          │  generateToken()       │
 │                          │  (JWT, 30d expiry)     │
 │◄── 200 { token, user } ──│                       │
 │    Set-Cookie: token     │                       │
```

### Google OAuth Flow

```
User                   Browser              Next.js API           Google
 │                        │                     │                    │
 │── Click Google Btn ───►│                     │                    │
 │                        │── Load GIS SDK ─────────────────────────►│
 │                        │◄── Render Button ───────────────────────│
 │── Select Account ─────►│                     │                    │
 │                        │◄── ID Token (JWT) ──────────────────────│
 │                        │                     │                    │
 │                        │── POST /api/auth/google/callback         │
 │                        │   { idToken }       │                    │
 │                        │                     │── verifyIdToken() ►│
 │                        │                     │◄── payload ────────│
 │                        │                     │  upsert user in DB │
 │                        │                     │  generate app JWT  │
 │                        │◄── 200 { token } ───│                    │
 │◄── Redirect /dashboard─│                     │                    │
```

### JWT Middleware Guard

```
Request ──► Middleware ──► Extract Bearer Token
                │
                ▼
           jwt.verify()
                │
       ┌────────┴────────┐
       │                 │
    Valid             Invalid
       │                 │
       ▼                 ▼
  req.user =        401 Unauthorized
  { email,
    username }
       │
       ▼
  Route Handler
```

---

## 🗄 Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│    users    │──────<│    tasks     │       │  habit_entries  │
│─────────────│       │──────────────│       │─────────────────│
│ email (PK)  │       │ id (PK)      │       │ id (PK)         │
│ username    │──────<│ habits       │       │ habit_id (FK)   │
│ password_   │       │──────────────│       │ completed_at    │
│  hash       │──────<│ planner_     │       └─────────────────┘
│ avatar_url  │       │  events      │
│ is_pro      │──────<│ notifications│       ┌─────────────────┐
│ created_at  │       │              │       │    streaks      │
└──────┬──────┘       └──────────────┘       │─────────────────│
       │                                     │ user_email (PK) │
       │              ┌──────────────┐       │ current_streak  │
       └─────────────<│   groups     │       │ longest_streak  │
       │              │──────────────│       │ total_points    │
       │              │ id (PK)      │       │ level           │
       └─────────────<│ group_       │       │ badges (JSON)   │
                      │  members     │       └─────────────────┘
                      │──────────────│
                      │ group_       │       ┌─────────────────┐
                      │  activities  │       │ behavior_logs   │
                      └──────────────┘       │─────────────────│
                                             │ event_type      │
                      ┌──────────────┐       │ entity_id       │
                      │ push_        │       │ metadata (JSON) │
                      │ subscriptions│       └─────────────────┘
                      └──────────────┘
```

**12 Models** · **15+ Indexes** · **Cascade deletes** · **UUID primary keys**

---

## 📡 API Reference

### Auth Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Email/password login | ❌ |
| POST | `/api/auth/google/callback` | Google OAuth token exchange | ❌ |
| POST | `/api/auth/forgot-password` | Send reset email | ❌ |
| POST | `/api/auth/reset-password` | Reset with token | ❌ |
| GET | `/api/auth/profile` | Get current user | ✅ |

### Task Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | List all user tasks | ✅ |
| POST | `/api/tasks` | Create task | ✅ |
| PATCH | `/api/tasks/[id]` | Update task | ✅ |
| DELETE | `/api/tasks/[id]` | Delete task | ✅ |

### AI Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/coach` | AI productivity coach chat |
| POST | `/api/ai/break-down-task` | Break task into subtasks |
| POST | `/api/ai/suggest-priority` | AI priority scoring |
| POST | `/api/ai/suggest-habits` | Personalized habit suggestions |
| POST | `/api/ai/generate-title` | Smart task title generation |
| GET | `/api/ai/streak-guardian` | AI streak risk analysis |

### Other Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/habits` | Habit CRUD |
| GET/POST | `/api/groups` | Group workspace CRUD |
| POST | `/api/groups/[id]/invite` | Invite member to group |
| GET | `/api/analytics` | Performance analytics |
| GET | `/api/streak` | User streak data |
| POST | `/api/payments/create-order` | Razorpay order creation |
| GET | `/api/notifications` | In-app notifications |
| POST | `/api/notifications/subscribe` | Web Push subscription |
| GET | `/api/health` | Service health check |
| GET | `/api/search` | Global search |

---

## 🤖 AI Features

Powered by **Groq API** (LLaMA 3 70B) for ultra-fast inference:

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│         AI Domain Layer         │
│                                 │
│  ┌─────────┐  ┌──────────────┐  │
│  │  Coach  │  │ Task Breaker │  │
│  │ (chat)  │  │ (subtasks)   │  │
│  └─────────┘  └──────────────┘  │
│                                 │
│  ┌─────────┐  ┌──────────────┐  │
│  │Priority │  │   Habit      │  │
│  │ Scorer  │  │  Suggester   │  │
│  └─────────┘  └──────────────┘  │
│                                 │
│  ┌──────────────────────────┐   │
│  │    Streak Guardian       │   │
│  │  (burnout risk alerts)   │   │
│  └──────────────────────────┘   │
└──────────────┬──────────────────┘
               │
               ▼
         Groq API
      (LLaMA 3 70B)
```

---

## 📁 Project Structure

```
taskos/
├── prisma/
│   └── schema.prisma          # 12 models, full DB schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, signup, reset pages
│   │   ├── (dashboard)/       # Protected app pages
│   │   │   ├── dashboard/     # Overview & stats
│   │   │   ├── tasks/         # Task management
│   │   │   ├── habits/        # Habit tracker
│   │   │   ├── planner/       # Calendar planner
│   │   │   ├── groups/        # Team workspaces
│   │   │   ├── analytics/     # Charts & insights
│   │   │   └── settings/      # Profile & preferences
│   │   ├── api/               # 14 API route groups
│   │   │   ├── auth/          # Auth + Google OAuth
│   │   │   ├── ai/            # 6 AI endpoints
│   │   │   ├── tasks/
│   │   │   ├── habits/
│   │   │   ├── groups/
│   │   │   ├── analytics/
│   │   │   ├── notifications/ # Push + in-app
│   │   │   ├── payments/      # Razorpay
│   │   │   └── streak/
│   │   └── page.tsx           # Landing page
│   ├── core/
│   │   ├── errors/            # Custom error classes + handler
│   │   ├── middleware/        # Rate limiter, auth guard
│   │   ├── logger/            # Structured logging
│   │   ├── cache/             # In-memory caching
│   │   └── events/            # Event bus
│   ├── domains/               # Business logic layer
│   │   ├── auth/              # AuthService, GoogleAuthService
│   │   ├── tasks/
│   │   ├── habits/
│   │   ├── gamification/      # XP, badges, streaks
│   │   ├── ai/                # AI orchestration
│   │   ├── collaboration/     # Group features
│   │   └── notifications/
│   ├── components/            # Shared UI components
│   ├── contexts/              # React context providers
│   ├── lib/                   # Prisma client, JWT, S3, utils
│   └── middleware/            # Next.js edge middleware
├── vercel.json                # Vercel deployment config
└── next.config.ts             # Security headers, image domains
```

---

## ⚙️ Environment Variables

```bash
# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="30d"

# App URLs
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_BACKEND_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"

# AI (Groq)
GROQ_API_KEY="gsk_xxx"

# AWS S3 (Avatars)
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_S3_BUCKET_NAME="your-bucket"
AWS_S3_REGION="ap-south-1"

# Payments (Razorpay)
RAZORPAY_KEY_ID="rzp_xxx"
RAZORPAY_KEY_SECRET="xxx"

# Email (Resend)
RESEND_API_KEY="re_xxx"
FROM_EMAIL="TaskOS <noreply@yourdomain.com>"

# Web Push (VAPID)
VAPID_PUBLIC_KEY="xxx"
VAPID_PRIVATE_KEY="xxx"
VAPID_SUBJECT="mailto:admin@yourdomain.com"
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- pnpm (`npm i -g pnpm`)
- PostgreSQL or a free [Neon](https://neon.tech) database

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/taskos.git
cd taskos

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Fill in your values in .env

# 4. Push database schema
npx prisma db push

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Management

```bash
pnpm db:studio     # Open Prisma Studio (visual DB browser)
pnpm db:push       # Push schema changes to DB
pnpm db:migrate    # Run migrations in production
pnpm db:generate   # Regenerate Prisma Client
```

---

## 🌍 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set build command: `prisma generate && next build`
5. Deploy → runs automatically on every push

### Google OAuth Setup (Required)

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized JavaScript Origins:** `https://your-domain.vercel.app`
- **Authorized Redirect URIs:** `https://your-domain.vercel.app/api/auth/google/callback`

---

## 🔒 Security

- **JWT** sessions with configurable expiry (default 30 days)
- **bcrypt** password hashing (cost factor 10)
- **Rate limiting** on all auth endpoints (5 req/min)
- **HTTP-only cookies** for token storage
- **COOP headers** (`same-origin-allow-popups`) for OAuth popup safety
- **Zod** schema validation on all API inputs
- **Prisma** parameterized queries (SQL injection prevention)
- **SSL-enforced** database connections

---

## 🏆 Gamification System

```
Task Complete  ──► +XP Points ──► Level Up
Habit Complete ──► Streak +1  ──► Badge Unlock
                        │
                        ▼
              Streak Guardian AI
              (detects burnout risk,
               sends encouragement)
```

**Levels:** Beginner → Achiever → Pro → Master → Legend  
**Badges:** Early Bird, Streak Master, Perfect Week, Group Leader, and more

---

## 📊 Analytics

Real-time charts built with **custom SVG** (no chart library dependency):

- Task completion rate over time
- Habit consistency heatmap
- Streak performance graph
- Category distribution breakdown
- Group leaderboard rankings

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by **Shitesh Khawas**

[![GitHub](https://img.shields.io/badge/GitHub-shiteshkhaw-181717?style=flat-square&logo=github)](https://github.com/shiteshkhaw)

</div>
