# FrameSpace v2 — Full Redesign + Feature Expansion

I have a 3D room designer called **FrameSpace**. Stack: React 18 + Vite + TypeScript + Tailwind v3 + Three.js (vanilla, not r3f) + Zustand. Frontend at `./frontend`, backend at `./backend` (Node + Express + MongoDB + JWT).

I want a complete redesign **and** a list of new features. You have three skills installed — apply them throughout, with the audit sequence from `redesign-existing-projects` as your master playbook:

- `design-taste-frontend`
- `high-end-visual-design`
- `redesign-existing-projects`

## CRITICAL EXECUTION RULES

1. **Work in phases.** Do not try to do everything in one pass. After each phase, run `git add -A && git commit -m "Phase X: …"` and confirm `npm run build` passes in `frontend/` before moving on. If you don't have git initialized, do that first.
2. **Check before installing.** Read `frontend/package.json` before any `npm install`. Stay on **Tailwind v3** — do not migrate to v4. Stay on React 18.
3. **Preserve existing functionality.** Every current API endpoint, route, store action, and 3D interaction must keep working. If a refactor would break a consumer, refactor the consumer too — no dead code.
4. **No emojis anywhere in the final output.** Replace every emoji (`🏠 🪑 ✨ 🛒 🎨 💾 🗑 ✏️` etc.) with Phosphor icons (`@phosphor-icons/react`), stroke weight 1.5 globally.
5. **No new fonts via Google Fonts CDN.** Install `geist` from npm and import its CSS. Geist for UI, Geist Mono for numerals / dimensions / IDs / coordinates.
6. **If a feature truly needs a separate session to be done well, say so and stop.** I'd rather have 60% done well than 100% done broken.

---

## PHASE 1 — Foundation

### Dependencies
After verifying they aren't already in `frontend/package.json`, install:
- `@phosphor-icons/react`
- `geist` (provides Geist Sans + Geist Mono CSS)
- `jspdf` and `jspdf-autotable` (for the cart PDF export in Phase 5)

### Theme system
Refactor `tailwind.config.js` and `src/index.css`:
- Enable `darkMode: 'class'`
- Define CSS variables for: background layers (base, raised, sunken), text (primary, secondary, muted), accent (refined warm brown), border / hairline. Both light and dark themes get their own values.
- The warm cream/brown palette is **preserved but elevated** — desaturate, calibrate, give it depth. Don't switch the brand to a dark or grey aesthetic.
- Components consume the CSS variables — no hardcoded hex colors outside the theme file.

Add `src/hooks/useTheme.ts`:
- Reads system preference on first load
- Persists choice in localStorage
- Toggles `.dark` class on `<html>`

Add a theme toggle to the Navbar.

### Typography
Replace Inter / Poppins with Geist (UI) + Geist Mono (numerals, coordinates, dimensions, file IDs). Apply `font-variant-numeric: tabular-nums` to all numeric chips in the designer. Negative letter-spacing (`tracking-tighter` or tighter) on display headers.

### Motion baseline
Add a custom transition timing function in Tailwind config: `cubic-bezier(0.32, 0.72, 0, 1)` — set as the default for `transition-*`. Sweep the codebase and replace every `ease-in-out` / `ease-out` / `linear` with the new curve. Add `active:scale-[0.98]` to every interactive button.

### Icon migration
Replace ALL emojis across:
- `pages/Landing.tsx` (features grid, CTA buttons)
- `pages/Dashboard.tsx` (stats cards, empty states, room/design action buttons)
- `pages/RoomDesigner.tsx` (toolbar, save button, tab nav icons)
- `components/common/Navbar.tsx`
- Any other file containing emoji
…with Phosphor icons at `weight="regular"` and stroke 1.5. Standardize globally — no mixing weights.

**Checkpoint commit: `Phase 1: foundation — theme, typography, icons`**

---

## PHASE 2 — Design Pass

Run the `redesign-existing-projects` audit (typography → color → layout → states → content → components → iconography → code quality → strategic omissions) on every page below, then apply `high-end-visual-design` archetypes. Pick the **Editorial Luxury** vibe archetype (matches the warm palette). Use **The Asymmetrical Bento** for the landing features grid and **The Editorial Split** for the dashboard header.

### Landing page (`pages/Landing.tsx`)
- Navbar → floating glass pill: `mt-6 mx-auto w-max rounded-full backdrop-blur-2xl`, hairline border, detached from top edge.
- Hero: keep the 3D preview window but wrap it in the **double-bezel** (outer shell `p-1.5 rounded-[2rem]`, inner core with `rounded-[calc(2rem-0.375rem)]` and inset highlight `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`). Add an eyebrow tag above the H1.
- Features section: convert the 3-column equal grid into an asymmetric bento — one hero feature card spanning `col-span-2 row-span-2`, three smaller cards stacked beside it. Mobile collapses to single-column stack.
- Scroll-driven entry animations using `IntersectionObserver` (never `window.addEventListener('scroll')`): each section enters with `translate-y-16 blur-md opacity-0` → resting state over 800ms with the cubic-bezier curve. Stagger child elements with 100-200ms delays.
- Replace the solid brand-brown CTA block with the Editorial Luxury treatment (muted background, large display headline).
- Add a "skip to content" hidden link as the first child of `<body>` for accessibility.

### Dashboard (`pages/Dashboard.tsx`)
- Apply double-bezel to room cards and design cards.
- Replace the 4-stat grid with one asymmetric "at a glance" panel: one large primary metric, three smaller satellite metrics.
- **Multi-step Create Room wizard** — split the modal into three steps with a progress indicator and back/next buttons:
  1. Name & Type
  2. Dimensions (width / depth / height)
  3. Style & Budget
  Validate each step before allowing forward. Add a step 0 for "Start from a template" (templates come in Phase 4).
- Empty states: custom inline SVG illustrations, no emoji.
- Skeleton loaders matching room-card and design-card shapes — replace the spinner.

### Designer (`pages/RoomDesigner.tsx`)
- **Unified command bar:** replace the three floating pills (room info, cost, save) at top-right with one unified glass command bar containing: room name + dimensions, cost chip (Geist Mono), Save action, Share action (new), Walk-mode toggle (Phase 3), 2D/3D toggle (Phase 3). Use the double-bezel.
- Sidebar tab buttons: redesign as a **vertical icon rail** on the left edge of the sidebar (Phosphor icons, stroke 1.5, tooltip on hover) instead of horizontal stacked icon-over-label tabs. Active tab highlighted via accent-tinted background.
- The "Drag furniture · Right-click to rotate · Scroll to zoom" hint becomes a dismissible toast shown once per session (`localStorage` flag).
- Save Design modal: rebuilt with the double-bezel, eyebrow tag, and the cubic-bezier motion.

### Common components
- `Navbar.tsx` → glass-pill version. Includes theme toggle.
- Replace every `confirm()` and `alert()` in the codebase with a proper toast / inline confirmation pattern. Use a lightweight toast system (build a small `Toast.tsx` + `useToast` hook — don't pull in `react-toastify`).

**Checkpoint commit: `Phase 2: full design pass per skills`**

---

## PHASE 3 — Designer Features (3D viewport upgrades)

### Snap-to-grid + alignment guides
In `RoomScene.tsx` / `useThreeScene.ts`:
- Snap furniture position to a **0.1m grid** by default. Hold `Shift` to bypass snap for fine placement.
- During drag, render thin dashed alignment guides (Three.js `Line` + `LineDashedMaterial`) when the dragged item's center or edge aligns with any other furniture's center or edge — horizontally or vertically. Guides disappear on drop.

### Undo / redo with keyboard shortcuts
- History stack in `useStore.ts`. Every mutation of `placedFurniture` pushes a snapshot. Cap at 50 states.
- Bind `Cmd/Ctrl+Z` for undo, `Shift+Cmd/Ctrl+Z` for redo — globally when the designer is the active route.

### First-person walk-through mode
- New "Walk" button in the command bar.
- Entering Walk mode:
  - Disables OrbitControls
  - Spawns camera at eye height (1.65m) at the center of the room
  - `WASD` = forward / back / strafe; click-drag for mouse look (PointerLockControls)
  - Wall collision: clamp position to room bounds minus a 0.2m buffer
  - `ESC` exits back to orbit view

### 2D top-down floor plan toggle
- "2D / 3D" toggle in the command bar.
- 2D mode: extend `RoomMinimap.tsx` into an interactive plan-view editor — same underlying state, rendered as labeled rectangles in SVG. Drag to move, rotation handle to rotate, click to select (selection syncs with 3D state). Furniture labels in Geist Mono.

### Time-of-day lighting simulation
- Slider in the "Room" sidebar tab: `06:00 → 22:00`.
- Drives Three.js directional light angle, color, and intensity (warm orange at sunrise / sunset, neutral white at noon, cool blue at night) + ambient intensity.
- At night, any furniture tagged as a "lamp" gets boosted emissive material.

### Dimension overlay
- When a furniture piece is selected, render W × D × H as an HTML overlay positioned via projected 3D coordinates (re-project each frame). Geist Mono, tabular numerals.

**Checkpoint commit: `Phase 3: designer 3D features`**

---

## PHASE 4 — Backend & Catalog

### Public read-only design URLs
- Add `shareId` (UUID) and `isPublic` (boolean) fields to the Design model.
- `GET /api/designs/public/:shareId` — no auth, returns the design + populated room.
- "Share" action in the command bar: toggles `isPublic`, generates `shareId` if missing, copies the URL `${window.location.origin}/view/:shareId` to clipboard with a toast confirmation.
- New frontend route `/view/:shareId` renders the 3D scene read-only — no sidebar, no edit, just the canvas, the room name, and a "Made with FrameSpace" footer link.

### Public design gallery
- `GET /api/designs/gallery?page=N` — paginated public designs, sorted by `updatedAt` DESC.
- New frontend route `/gallery` with a masonry grid. Each card: `RoomMinimap` preview + design name + author first name + cost + Remix button.
- **Remix** = clone the design into the current user's account (new ObjectId, copy furnitureLayout), navigate to the designer. If the user isn't logged in, open the auth modal first.

### AI text-to-room generator
- `POST /api/designs/generate` with body `{ prompt: string, roomId: string }`.
- Backend: parse the prompt for style/mood keywords (`cozy`, `modern`, `minimalist`, `reading`, `family`, `workspace`, `bedroom`, etc.) using a keyword → tag map, query the furniture catalog matching the room's existing style + budget, return a curated layout with positions (computed via simple placement heuristics — sofa against longest wall, table centered, chairs flanking, etc.) and rotations.
- Frontend: new "AI Generate" button in `RecommendationsPanel.tsx` opens a prompt input modal. Submitting applies the returned layout to the current room (confirm dialog if `placedFurniture.length > 0`).

### Design version history
- New `DesignVersion` Mongoose model: `{ designId, snapshot, createdAt }`.
- On every Design update, copy the current state into a new `DesignVersion` **before** writing the update. Keep the last 20 versions per design (delete older).
- `GET /api/designs/:id/versions` — list of versions, newest first.
- New "History" tab in the designer sidebar showing a timeline of versions, each rendered via `RoomMinimap`. Click to restore (with confirmation).

### Room templates
- New `RoomTemplate` Mongoose model + seed 6 templates:
  1. Minimalist studio
  2. Family living room
  3. Home office
  4. Cozy bedroom
  5. Modern dining
  6. Reading nook
- Each template has dimensions, style, budget, AND a starter `furnitureLayout`.
- `GET /api/templates` returns the list.
- Wire into the multi-step Create Room wizard from Phase 2 — picking a template auto-populates everything and skips remaining steps.

### Wall decor + plants/decor categories
- Extend the `Furniture` model `category` field to accept `wall-decor` and `decor`.
- Seed ~15 new items: framed art, mirrors, wall clocks (wall-decor); plants in pots, vases, rugs, throw pillows, candles (decor).
- **Wall-decor placement:** items snap to the nearest wall — project the drop position onto the closest wall plane and orient the normal outward.
- **Decor:** behaves like regular furniture but with smaller default scale.
- Frontend: add category filter chips in `FurniturePanel.tsx` (`All / Furniture / Wall Decor / Decor`).

**Checkpoint commit: `Phase 4: backend features + new catalog categories`**

---

## PHASE 5 — Power-user polish

### Compare designs side-by-side
- New route `/compare?a=designId1&b=designId2`.
- Split view rendering two scaled-down RoomScenes.
- Camera controls synced between them by default with a toggle to unlink.
- Below each scene: design name, total cost, item count.
- Below the split: a "differences" panel — items only in A, items only in B, items in both (compared by `furnitureId`).
- Accessible from the Dashboard "Designs" tab: select two designs (multi-select) → "Compare" button appears.

### Export-to-PDF for cart / shopping list
- "Export PDF" button in `CartPanel.tsx`.
- `jspdf` + `jspdf-autotable`: FrameSpace header, room name, date, table of items (name, color, material, price, store link), subtotal + total, and an embedded thumbnail of the room minimap (rendered to canvas, converted to PNG, embedded).

### Keyboard shortcuts panel
- Press `?` anywhere in the designer to open a modal listing all shortcuts:
  - `Cmd/Ctrl+Z` / `Shift+Cmd/Ctrl+Z` — Undo / Redo
  - `Cmd/Ctrl+S` — Save design
  - `W` — Toggle Walk mode
  - `2` — Toggle 2D view
  - `Delete` — Remove selected furniture
  - `R` — Rotate selected 90°
  - `ESC` — Deselect / exit Walk mode
  - `?` — This panel
- Implement every shortcut. Some may already exist — keep and unify.

**Checkpoint commit: `Phase 5: power-user features`**

---

## FINAL VERIFICATION

Before declaring done, run through this checklist:

- [ ] `npm run build` passes in `frontend/` with zero TypeScript errors
- [ ] No emojis remain in `src/` (`grep -rP "[\x{1F300}-\x{1F9FF}]" frontend/src/` finds nothing)
- [ ] Dark mode toggles correctly on every page, including the 3D scene (adjust scene clear color / fog)
- [ ] No `h-screen` anywhere — all full-height sections use `min-h-[100dvh]`
- [ ] No `confirm()` or `alert()` calls remain
- [ ] Mobile (<768px) tested: every page collapses to single column; the designer sidebar becomes a slide-up sheet
- [ ] All transitions use the cubic-bezier curve, none use `ease-in-out`
- [ ] Existing rooms and designs from MongoDB still load and render
- [ ] All API endpoints from the original README still respond
- [ ] No `<form>` tags submit synchronously — all forms use controlled inputs + event handlers
- [ ] All animated properties are `transform` or `opacity` — never `top` / `left` / `width` / `height`
- [ ] `backdrop-blur` is only on fixed / sticky elements, never on scrolling containers

**If scope feels too large mid-run, commit what you have, summarize what's left, and stop.** I would rather have 60% done well than 100% done broken.