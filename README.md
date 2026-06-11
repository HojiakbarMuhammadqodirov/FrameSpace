# FrameSpace - 3D Room Designer

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env   # Edit MONGO_URI and JWT_SECRET
npm install
npm run seed           # Seed furniture catalog
npm run dev            # Start on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Start on http://localhost:5173
```

### 3. Open http://localhost:5173

## Features
- 3D room visualization with Three.js (walls, floor, ceiling, windows, doors)
- Drag & drop furniture placement
- 360° rotation, view presets (front, side, top, default)
- AI-powered furniture recommendations
- Full furniture catalog with color/material customization
- Save & load room designs
- Shopping cart with direct buy links

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Three.js + Zustand
- **Backend**: Node.js + Express + MongoDB + JWT

## API Endpoints
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET  /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET  /api/furniture` - Browse catalog
- `POST /api/furniture/recommend` - Get AI recommendations
- `GET  /api/designs` - List designs
- `POST /api/designs` - Save design
