# TaskOS: Elite-Grade Behavioral Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange?style=for-the-badge)](https://groq.com/)

TaskOS is not just a task manager; it is a **high-performance behavioral engineering platform**. Built with a focus on cognitive load reduction and neural momentum, TaskOS leverages an AI-driven Behavioral Intelligence Engine to transform standard productivity workflows into a scientific pursuit of the "Flow State."

---

## 🧠 Core USP: Behavioral Intelligence Engine

Unlike traditional "dumb" list apps, TaskOS features a proactive intelligence layer that understands your habits and cognitive bandwidth.

### 🛡️ Predictive Streak Guardian
An AI-driven monitoring service that calculates habit decay risks in real-time. It uses deterministic risk-scoring algorithms to warn you *before* a streak is lost, protecting your neural continuity.

### 🔮 AI Productivity Coach (Powered by Groq)
A context-aware coach integrated directly into the dashboard. Using **Llama 3.1 via Groq API**, the coach analyzes your current tasks, active habits, and streak momentum to provide specific, high-impact advice on what to tackle next.

### 🎭 Psychologically Engineered UI
The interface is designed using **behavioral psychology principles**. Every label, from "Cognitive Throughput" to "Ritual Momentum," is crafted to reinforce a high-performance mindset and minimize decision fatigue.

---

## 🏗️ Technical Architecture

TaskOS is architected for scalability, maintainability, and senior-level production standards.

### 🏛️ Domain-Driven Design (DDD)
The codebase is decoupled into clean domains:
- **AI Domain**: Implements the Strategy Pattern for plug-and-play LLM providers (Groq, Gemini, Rule-based).
- **Task Domain**: Handles complex recursive subtask logic and intelligent prioritization.
- **Habit Domain**: Manages temporal streak logic and behavioral history.

### 📡 Event-Driven Caching
Uses a robust event-driven architecture to maintain data integrity. Cache invalidation is handled via domain events, ensuring the Behavioral Engine always works with the latest state without redundant DB hits.

### 🔒 Enterprise-Grade Security
- **Strict RBAC**: Role-Based Access Control integrated into the core middleware.
- **Security Hardening**: JWT-based authentication, salted hashing, and strict environment isolation.
- **Type Safety**: End-to-end TypeScript coverage from the Prisma schema to the Frontend DTOs.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, CSS Modules (Custom Design System)
- **AI Engine**: Groq Llama 3.1 (Low-latency inference)
- **Database**: PostgreSQL + Prisma ORM
- **Infrastructure**: Event-driven architecture, Strategy Design Pattern
- **Payments**: Razorpay Integration (Feature Gating)
- **Auth**: Secure JWT + Middleware protection

---

## 📦 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL (Local or Cloud)
- Groq API Key (for the Productivity Coach)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shiteshkhaw/TaskOS.git

# 2. Install dependencies
npm install

# 3. Environment Setup
cp env.example.txt .env
# Important: Add your GROQ_API_KEY for the AI Coach

# 4. Database Setup
npx prisma generate
npx prisma db push

# 5. Launch Development
npm run dev
```

---

## 📁 Senior-Level Project Structure

```text
src/
├── domains/           # Domain-Driven Core Logic
│   ├── ai/            # Strategy pattern + AI logic
│   ├── tasks/         # Task services & repositories
│   └── habits/        # Behavioral streak logic
├── app/               # Next.js 15 App Router & API Endpoints
├── components/        # UI Component Library (Atomized)
├── core/              # Global events, constants, & types
├── lib/               # Shared utilities (API Client, DB)
└── contexts/          # State management (Auth, Theme)
```

---

## 👨‍💻 Developer Note
TaskOS was built to showcase the intersection of **AI Engineering**, **Clean Architecture**, and **Product Psychology**. It demonstrates the ability to build complex, decoupled systems that provide real-world value through proactive intelligence.

---

## 📄 License
MIT
