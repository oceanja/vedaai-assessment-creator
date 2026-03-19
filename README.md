<div align="center">

<img src="https://img.shields.io/badge/VedaAI-Assessment%20Creator-E07B39?style=for-the-badge&logo=bookstack&logoColor=white" alt="VedaAI" />

# AI Assessment Creator

### Generate structured, exam-ready question papers in seconds using AI

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF6B6B?style=flat-square&logo=bull&logoColor=white)](https://docs.bullmq.io)

[**▶ Watch Demo**](https://drive.google.com/file/d/1bGe5L6QI3QjKDRcI55ixvLKGDTulyY4H/view?usp=sharing)

> **Note:** In the demo video, MCQ options are not visible — this has since been fixed. MCQs now correctly display A) B) C) D) options beneath each question.

</div>

---

## What is this?

VedaAI Assessment Creator is a full-stack application that lets teachers create professional exam papers using AI. Fill in a form, pick your question types and marks — the AI generates a fully structured, print-ready question paper with difficulty-tagged questions, an answer key, and PDF export. All powered by a real-time async pipeline.

---

## Features

| | Feature |
|---|---|
| 📝 | **Smart Assignment Form** — file upload, due date, dynamic question types with per-section mark controls |
| 🤖 | **AI Question Generation** — Groq (Llama 3.3 70B) generates questions with proper difficulty distribution |
| ⚡ | **Real-time Updates** — WebSocket + BullMQ background jobs; the UI updates live as generation completes |
| 📄 | **Structured Exam Paper** — sections, difficulty badges (Easy / Moderate / Challenging), student info, answer key |
| 🔤 | **MCQ with Options** — Multiple Choice Questions include A) B) C) D) answer options |
| 📥 | **PDF Export** — properly formatted PDF via `@react-pdf/renderer` (not raw HTML print) |
| 🔄 | **Regenerate** — re-run AI on any existing assignment |
| 📱 | **Mobile Responsive** — drawer sidebar + bottom tab navigation on mobile |
| 🛡️ | **Safe AI Output** — every AI response validated with Zod before hitting the DB or UI |

---

## Architecture

```
Teacher fills form
       │
       ▼
POST /api/assignments          ←── Next.js frontend (Zustand state)
       │                                    ▲
       ├── Save to MongoDB                  │ WebSocket
       ├── Enqueue BullMQ job               │ (real-time updates)
       └── Return { assignmentId }          │
                                            │
       BullMQ Worker ──────────────────────►┘
       ├── Calls Groq API (Llama 3.3 70B)
       ├── Validates response with Zod
       ├── Stores GeneratedPaper in MongoDB
       └── Broadcasts via WebSocket

Infrastructure:
├── Redis     → BullMQ job queue + state
└── MongoDB   → Assignments + generated papers
```

### Full Request Flow

```
1. Form submit  →  POST /api/assignments  →  { assignmentId }
2. WS connect   →  subscribe(assignmentId)
3. Worker       →  queued → processing → done
4. WS push      →  { status: "done", data: GeneratedPaper }
5. Frontend     →  renders structured exam paper
6. Fallback     →  polling every 5s if WebSocket drops
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, fast DX |
| State | Zustand | Same power as Redux, 80% less boilerplate |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Backend | Node.js + Express + TypeScript | Fast, typed, well-supported |
| Database | MongoDB + Mongoose | Flexible schema for AI-generated content |
| Queue | BullMQ + Redis | Decouples slow AI work from HTTP request |
| Real-time | WebSocket (`ws`) | Live generation progress without polling |
| AI | Groq API — `llama-3.3-70b-versatile` | Fast inference, free tier, strong JSON output |
| Validation | Zod | Schema-safe AI output — never render raw LLM response |
| PDF | @react-pdf/renderer | Real PDFs with typography, not browser print |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (`brew install mongodb-community`)
- Redis (`brew install redis`)
- Groq API key — free at [console.groq.com](https://console.groq.com)

---

### 1. Start Services

```bash
brew services start mongodb-community
brew services start redis
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # then add your GROQ_API_KEY
npm run dev
# → http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

---

### Environment Variables

**`backend/.env`**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_your-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

---

## Project Structure

```
├── frontend/src/
│   ├── app/
│   │   ├── assignments/page.tsx          # Dashboard (empty + filled state)
│   │   ├── assignments/create/page.tsx   # Create assignment form
│   │   └── assignments/[id]/page.tsx     # Output exam paper
│   ├── components/
│   │   ├── layout/       AppShell, Sidebar (mobile drawer + bottom nav)
│   │   ├── dashboard/    EmptyState, AssignmentCard
│   │   ├── create/       FileUpload, QuestionTypeRow, StepProgress
│   │   └── output/       ExamPaper, DifficultyBadge, PDFDocument, PDFDownloadButton
│   ├── store/            assignmentStore.ts  (Zustand)
│   ├── lib/              api.ts, websocket.ts
│   └── types/            index.ts
│
└── backend/src/
    ├── index.ts                  Express + WebSocket server
    ├── models/Assignment.ts      Mongoose model
    ├── routes/assignments.ts     REST API
    ├── queues/index.ts           BullMQ setup
    ├── workers/generationWorker  BullMQ worker (AI generation)
    ├── services/aiService.ts     Groq API + Zod validation
    ├── services/websocketService WebSocket subscriptions + broadcast
    └── types/index.ts            Zod schemas + shared types
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/assignments` | Create assignment + enqueue AI generation |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get assignment with generated paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `POST` | `/api/assignments/:id/regenerate` | Re-queue AI generation |
| `GET` | `/health` | Health check |

### WebSocket Protocol

```json
// Subscribe to job updates
{ "type": "subscribe", "assignmentId": "abc123" }

// Receive status updates
{ "type": "status_update", "status": "processing", "assignmentId": "abc123" }
{ "type": "status_update", "status": "done", "assignmentId": "abc123", "data": { ...GeneratedPaper } }
```

Status flow: `queued` → `processing` → `done` | `error`

---

## Key Design Decisions

**Why async job queue?**
AI generation takes 10–30 seconds. BullMQ decouples the HTTP request from the slow work — the API responds instantly with an ID, the worker runs asynchronously, and WebSocket delivers the result live. Includes retry logic (3 attempts, exponential backoff).

**Why Zod for AI output?**
LLMs can hallucinate structure. Every response is parsed and validated against a strict Zod schema before it touches the database or frontend. Raw AI output is never rendered directly.

**Why Groq over OpenAI?**
Free tier, fast inference (~3–5s for 70B), and `llama-3.3-70b-versatile` is strong at following structured JSON instructions.

**Why Zustand over Redux?**
Same reactivity and devtools support, without reducers/actions/selectors boilerplate. The store cleanly manages both form state and generation status in one place.

---

<div align="center">

Built for VedaAI Full Stack Engineering Assignment

</div>
