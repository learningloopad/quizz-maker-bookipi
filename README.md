# Quiz Maker (Take-home Frontend)

A small React app with two main flows:

- Builder: create and publish quizzes with MCQ + short-answer questions.
- Play: take quizzes by ID and submit answers for grading.

## What Is Implemented

### Builder Flow

- Create quiz metadata and questions.
- Max question limit: `20`.
- A quiz can contain any supported mix of question types (including all-MCQ or all-short).
- Save behavior uses concurrency-limited batching (`limit = 3`) for creating questions.
- Per-question sync states in UI: pending, saving, saved, failed.
- Retry failed question saves only.
- Quiz is published (`PATCH /quizzes/:id` with `isPublished: true`) only after all questions are saved.

### Play Flow

- Start attempt by quiz ID.
- Answer MCQ, short, and code prompts.
- Submit is gated by graded questions only (MCQ + short). Code-question answers are optional for submit.
- Submission uses concurrency-limited batching (`limit = 3`) for answer upserts.
- Progress UI while answers sync.
- Retry only failed answers.
- Final grading happens after successful answer sync.

### Additional UX/Behavior

- Basic anti-cheat event logging (blur/focus/paste) during attempts.
- Responsive, card-based layout across Home, Builder, and Play pages.

## Architecture Decisions and Trade-offs

- React Query mutations for all API writes:
  - Decision: keep API calls inside domain hooks and execute via `useMutation`.
  - Trade-off: less flexibility for ad-hoc calls in components, but clearer side-effect boundaries and retry/error lifecycle.

- Concurrency-limited batching (`limit = 3`) for save/submit:
  - Decision: process requests in small parallel batches instead of sequential or fully parallel.
  - Trade-off: faster than sequential with lower risk than full parallel spikes; implementation is slightly more complex due to per-item status tracking.

- Retry failed items only:
  - Decision: preserve successful writes and retry only failed questions/answers.
  - Trade-off: requires sync-state bookkeeping, but improves UX and avoids duplicate writes.

- Simple local reducer state for sync progress:
  - Decision: use `useReducer` in hooks for phase + per-item status state.
  - Trade-off: extra reducer boilerplate, but predictable transitions and easier debugging.

- Intentionally lean scope:
  - Decision: local hook state and React Query mutations cover all data needs without a global store; UI components stay close to shadcn defaults.
  - Trade-off: well-matched to a focused two-flow app — adding a global state layer or cache abstraction here would introduce complexity without a clear benefit at this scale.

## Anti-cheat Logging (What and Where)

Logged events in Play mode:

- `blur` when the tab/window loses focus.
- `focus` when the tab/window regains focus.
- `paste:question:<id>` when the user pastes into answer inputs.

Where events are sent:

- Endpoint: `POST /attempts/:id/events`
- Trigger point: during submit flow, before answer upserts/final submit
- Client implementation: `recordEvent` in `src/api/attempts.ts`, used by `useAttemptSession`

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query (`useMutation`) for all API mutations
- Tailwind CSS + shadcn/ui components
- ESLint + Prettier

## Setup

### 1) Start the backend API

Run the provided Node.js + SQLite backend first (from the backend project) and keep it running.
This frontend expects:

- API base URL: `http://localhost:4000`
- Auth token: `dev-token`

### 2) Install dependencies

```bash
pnpm install
# or
npm install
```

### 3) Configure environment

Copy and adjust `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required vars:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TOKEN=dev-token
```

### 4) Run app

```bash
pnpm dev
# or
npm run dev
```

## Scripts

- `pnpm dev` or `npm run dev` - start dev server
- `pnpm build` or `npm run build` - type-check + production build
- `pnpm ts-check` or `npm run ts-check` - run TypeScript build checks
- `pnpm lint` or `npm run lint` - run ESLint
- `pnpm format` or `npm run format` - format `src/` with Prettier
- `pnpm preview` or `npm run preview` - preview production build

## API Endpoints Used

- `POST /quizzes`
- `POST /quizzes/:id/questions`
- `PATCH /quizzes/:id`
- `POST /attempts`
- `POST /attempts/:id/answer`
- `POST /attempts/:id/submit`
- `POST /attempts/:id/events`

## Project Structure

- `src/pages` - route pages (`HomePage`, `BuilderPage`, `PlayPage`)
- `src/hooks` - domain hooks for builder save flow and attempt flow
- `src/api` - API client and endpoint helpers
- `src/components/builder` - builder question editors/cards
- `src/components/player` - play flow question/result components
- `src/components/ui` - shared UI primitives
- `src/utils` - draft creation and validation utilities
- `src/types` - shared API/domain types
