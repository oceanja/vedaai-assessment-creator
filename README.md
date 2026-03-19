# VedaAI – AI Assessment Creator

An AI-powered question paper generator for teachers. Create structured exam papers with AI, in seconds.

---

## Features

- **Assignment creation form** — file upload, due date, dynamic question types with per-section marks
- **AI question generation** — Groq (Llama 3.3 70B) generates questions per section with difficulty tags (Easy / Moderate / Challenging)
- **Real-time progress** — WebSocket + BullMQ background job with live status updates
- **Exam paper output** — structured, print-ready question paper with student info section and answer key
- **PDF export** — properly formatted PDF via `@react-pdf/renderer`
- **Regenerate** — re-run AI generation on existing assignments
- **Mobile responsive** — drawer sidebar + bottom tab navigation on mobile

---

## Demo

[Watch Demo Video](https://drive.google.com/file/d/1bGe5L6QI3QjKDRcI55ixvLKGDTulyY4H/view?usp=sharing)

> **Note:** In the demo video, Multiple Choice Questions appear without answer options. This has since been fixed — MCQ questions now correctly display A) B) C) D) options beneath each question.

---

## Screenshots

| Dashboard | Create Assignment | Exam Paper Output |
|---|---|---|
| Empty state with illustrations | Dynamic question type rows | Structured paper with difficulty badges |

---

## Architecture

```
Frontend (Next.js 14)              Backend (Express + TypeScript)
┌────────────────────────┐         ┌──────────────────────────────┐
│  /assignments          │──POST──▶│  POST /api/assignments        │
│  (Dashboard)           │         │  → validates input            │
│                        │         │  → saves to MongoDB           │
│  /assignments/create   │         │  → enqueues BullMQ job        │
│  (Zustand form state)  │◀──WS───│  → returns { assignmentId }   │
│                        │         │                               │
│  /assignments/[id]     │         │  BullMQ Worker                │
│  (output + PDF)        │         │  → calls Groq API             │
└────────────────────────┘         │  → validates with Zod         │
                                   │  → stores GeneratedPaper      │
         Zustand store             │  → notifies via WebSocket     │
         WebSocket client          └──────────────────────────────┘
                                          │           │
                                       Redis        MongoDB
                                    (job queue)   (assignments
                                                  + results)
```

### Data Flow

1. Teacher fills the assignment form (Zustand state)
2. Submit → `POST /api/assignments` → returns `{ assignmentId }`
3. Frontend opens WebSocket, subscribes to `assignmentId`
4. Backend enqueues BullMQ job, immediately returns
5. Worker calls Groq API (`llama-3.3-70b-versatile`) with structured prompt
6. Response validated with Zod schema — never rendered raw
7. Result stored in MongoDB
8. WebSocket pushes `{ type: "status_update", status: "done", data: GeneratedPaper }`
9. Frontend renders structured exam paper
10. Fallback polling every 5s if WebSocket drops

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand (with devtools) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose) |
| Queue | BullMQ + Redis |
| Real-time | WebSocket (`ws`) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Validation | Zod (AI output schema validation) |
| PDF | @react-pdf/renderer (client-side) |

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Redis running locally (`redis://localhost:6379`)
- Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Start MongoDB & Redis

```bash
brew services start mongodb-community
brew services start redis
```

---

### 2. Backend

```bash
cd backend
npm install

cp .env.example .env
# Add your GROQ_API_KEY in .env

npm run dev
```

Backend runs on `http://localhost:4000`

---

### 3. Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local

npm run dev
```

Frontend runs on `http://localhost:3000`

---

### Environment Variables

**backend/.env**
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_your-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

---

## Project Structure

```
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                        (redirects to /assignments)
│       │   └── assignments/
│       │       ├── page.tsx                    (dashboard — empty + filled state)
│       │       ├── create/page.tsx             (create assignment form)
│       │       └── [id]/page.tsx               (output exam paper)
│       ├── components/
│       │   ├── layout/AppShell.tsx             (sidebar + mobile drawer + bottom nav)
│       │   ├── layout/Sidebar.tsx
│       │   ├── dashboard/EmptyState.tsx
│       │   ├── dashboard/AssignmentCard.tsx
│       │   ├── create/FileUpload.tsx           (drag & drop)
│       │   ├── create/QuestionTypeRow.tsx      (dynamic +/- counters)
│       │   ├── create/StepProgress.tsx
│       │   ├── output/ExamPaper.tsx            (structured exam paper)
│       │   ├── output/DifficultyBadge.tsx
│       │   ├── output/PDFDocument.tsx          (react-pdf layout)
│       │   └── output/PDFDownloadButton.tsx    (client-only PDF download)
│       ├── store/assignmentStore.ts            (Zustand — form + generation state)
│       ├── lib/api.ts                          (Axios API client)
│       ├── lib/websocket.ts                    (WS singleton with reconnect)
│       └── types/index.ts
│
└── backend/
    └── src/
        ├── index.ts                            (Express + WebSocket server)
        ├── models/Assignment.ts                (Mongoose model)
        ├── routes/assignments.ts               (REST API + multer file upload)
        ├── queues/index.ts                     (BullMQ queue setup)
        ├── workers/generationWorker.ts         (BullMQ worker — AI generation)
        ├── services/aiService.ts               (Groq API + Zod validation)
        ├── services/websocketService.ts        (WS subscription + broadcast)
        └── types/index.ts                      (Zod schemas + shared types)
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/assignments` | Create assignment + enqueue generation |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get single assignment with generated paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `POST` | `/api/assignments/:id/regenerate` | Re-queue AI generation |
| `GET` | `/health` | Health check |

### WebSocket Protocol

Connect to `ws://localhost:4000`

```json
// Client → Server (subscribe)
{ "type": "subscribe", "assignmentId": "..." }

// Server → Client (update)
{ "type": "status_update", "assignmentId": "...", "status": "done", "data": { ...GeneratedPaper } }
```

Status values: `queued` → `processing` → `done` | `error`

---

## Design Decisions

### Why Groq + Llama 3.3 70B?
Fast, free tier available, and strong at structured JSON output. The prompt instructs the model to return a strict schema which is then validated with Zod before touching the database or frontend — raw AI output is never rendered directly.

### Why BullMQ?
AI generation takes 10–30 seconds. BullMQ decouples the HTTP request from the slow work — the API responds instantly with an assignment ID, the worker processes asynchronously, and WebSocket delivers the result in real time. Includes retry logic (3 attempts with exponential backoff).

### Why Zustand over Redux?
Same capabilities with 80% less boilerplate. The store manages both the form state and generation status cleanly without reducers/actions/selectors overhead.

### PDF Export
`@react-pdf/renderer` generates real PDFs with proper typography and layout — not an HTML print. Runs entirely client-side via a dynamically imported component (avoids SSR issues).

### WebSocket Resilience
The WS client reconnects automatically on disconnect, queues subscriptions that arrive before the connection is open, and the frontend also polls every 5 seconds as a fallback.
