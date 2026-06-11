# FrameSpace — 3D Room Designer

## Project Overview
A full-stack 3D room design application. Users design rooms in a Three.js 3D viewport, place furniture from a catalog, get AI-powered recommendations, and save/load designs. Auth is JWT-based.

## Tech Stack

**Frontend** (`frontend/`) — React 18 + TypeScript + Vite
- Styling: Tailwind CSS v3
- 3D: Three.js `^0.160.0`
- State: Zustand (`store/useStore.ts`)
- Routing: React Router v6
- HTTP: Axios (`services/api.ts`)

**Backend** (`backend/`) — Node.js + Express (`server.js`)
- DB: MongoDB via Mongoose
- Auth: JWT + bcryptjs
- Validation: express-validator

## Project Structure

```
frontend/src/
  components/
    auth/         AuthModal.tsx
    common/       Navbar, LoadingSpinner, ProtectedRoute
    furniture/    CartPanel, FurnitureControls, FurniturePanel, RecommendationsPanel
    room/         LandingScene, RoomEditor, RoomMinimap, RoomScene, ViewControls
  hooks/          furnitureBuilder.ts, useThreeScene.ts
  pages/          Dashboard, Landing, Profile, RoomDesigner
  services/       api.ts          (all Axios calls)
  store/          useStore.ts     (Zustand global store)
  types/          index.ts

backend/
  server.js       (Express entry, routes, Mongoose models)
  .env            MONGO_URI, JWT_SECRET, PORT
```

## Dev Commands

```bash
# Backend — http://localhost:5000
cd backend && npm run dev

# Frontend — http://localhost:5173
cd frontend && npm run dev

# Seed furniture catalog
cd backend && npm run seed
```

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/rooms` | List user's rooms |
| POST | `/api/rooms` | Create room |
| GET | `/api/furniture` | Browse catalog |
| POST | `/api/furniture/recommend` | AI furniture recommendations |
| GET | `/api/designs` | List saved designs |
| POST | `/api/designs` | Save design |

## Frontend Architecture Notes

- **Global state** lives in `store/useStore.ts` (Zustand). Do not add new global state for UI-only concerns — use local `useState`.
- **Three.js scene** is managed in `hooks/useThreeScene.ts`. The `RoomScene` component owns the canvas; `RoomEditor` wraps controls.
- **Furniture building** logic (geometry, materials) is in `hooks/furnitureBuilder.ts` — keep Three.js math out of components.
- **API calls** go through `services/api.ts` only. Never call `axios` directly in components.
- Auth token is stored in Zustand and attached to Axios requests via interceptor in `api.ts`.

## Design Standards

This project uses the **high-end-visual-design**, **design-taste-frontend**, and **redesign-existing-projects** skills. When writing or editing UI:

- Font: `Geist` or `Satoshi` — Inter is banned
- Icons: `@phosphor-icons/react` — Lucide is banned
- No `h-screen` — use `min-h-[100dvh]`
- No 3-column equal card grids — use asymmetric layouts
- No pure `#000000` — use `zinc-950` or off-black
- Animate only `transform` and `opacity` — never layout properties
- `backdrop-blur` on fixed/sticky elements only

## Dependencies Already Installed

**Frontend:** `react`, `react-dom`, `react-router-dom`, `three`, `zustand`, `axios`

Check `frontend/package.json` before importing any additional library. Output the install command if a package is missing.

## Environment Variables

```
# backend/.env
MONGO_URI=
JWT_SECRET=
PORT=5000
```
