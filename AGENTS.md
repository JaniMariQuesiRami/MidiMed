# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` using Next.js App Router.
  - `src/app/`: routes, layouts, and global styles (`globals.css`).
  - `src/components/`: feature components (PascalCase) and primitives under `components/ui` (lowercase filenames).
  - `src/db/`: Firestore data access helpers (patients, users, billing, etc.).
  - `src/lib/`: cross‑cutting libs (Firebase init, utils, schedulers).
  - `src/utils/`, `src/hooks/`, `src/contexts/`, `src/types/`: shared helpers.
- Assets: `public/` (images, icons). Do not edit `.next/` (build output).
- Path alias: import app code via `@/...` (see `tsconfig.json`).

## Build, Test, and Development Commands
- `npm run dev`: start local server with Turbopack at `http://localhost:3000`.
- `npm run build`: production build (checks types and optimizes output).
- `npm start`: serve the production build.
- `npm run lint`: run ESLint (`next/core-web-vitals`, TypeScript rules).
- `npm run format`: auto‑fix lint issues where possible.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Prefer explicit types on public APIs.
- Components: React Server Components by default; add `"use client"` only when needed.
- Filenames: PascalCase for feature components (e.g., `PatientInfoCard.tsx`); lower‑case for UI primitives (e.g., `components/ui/button.tsx`).
- Imports: use `@/` alias; group external → internal; no deep relative paths (`../../..`).
- Styling: Tailwind CSS (see `tailwind.config.js`); keep classlists small and extract to components when complex.
- Linting: fix warnings before merging; no `any` unless justified in code.

## Testing Guidelines
- No test runner is configured yet. If adding tests, colocate as `*.test.ts(x)` near sources and propose scripts in `package.json` (e.g., Jest + React Testing Library or Playwright for e2e).
- Add minimal mocks for Firebase where applicable; avoid networked tests.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) as seen in history.
- PRs: include purpose, scope, and screenshots for UI changes; link related issues; note any env or migration steps.
- Checks: ensure `lint` passes and app builds (`npm run build`).

## Security & Configuration Tips
- Environment: add secrets to `.env.local` (never commit). Required keys include `NEXT_PUBLIC_POSTHOG_KEY` and Firebase vars (`NEXT_PUBLIC_FIREBASE_*`) used in `src/lib/firebase.ts`.
- Images: external domains are restricted in `next.config.ts` (Firebase Storage); add new domains if needed.

## Architecture Overview
- Data: Firestore via thin modules in `src/db/*`.
- State: React Contexts (`UserContext`, `ThemeContext`), lightweight utils for analytics (`posthogClient`).
- Payments: see `frontend.md` for Recurrente integration flow.

