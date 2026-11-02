# Geraldfit — Full System Architecture & Implementation Blueprint

## 1. Project Overview & Folder Structure
**Geraldfit** is a full-stack personal athletic and home-training web application tailored for football players. This document serves as the complete technical blueprint to be placed in your VS Code workspace directory (`/geraldfit/geraldfit_architecture.md`).

### Recommended Project Folder Tree (`/geraldfit`)
```text
geraldfit/
├── geraldfit_architecture.md   <-- Architecture Document (This File)
├── client/                     <-- React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         <-- UI Components (Navbar, Cards, Timers)
│   │   ├── pages/              <-- Routes (Landing, Auth, Dashboard, App)
│   │   ├── styles/             <-- Tailwind/CSS Theme Configuration
│   │   ├── context/            <-- Auth & Workout State
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── server/                     <-- Express Backend API
    ├── config/                 <-- Database Connection Config
    ├── controllers/            <-- Auth, Workouts, Progress Controllers
    ├── middleware/             <-- JWT Auth Middleware
    ├── models/                 <-- Database Schemas / Models
    ├── routes/                 <-- Express Routes
    ├── server.js
    └── package.json
```

---

## 2. Branding & Color Palette Specification

The UI uses an athletic, high-intensity dark theme styled with **Tailwind CSS**.

| Color Role | Hex Code | Tailwind Class / Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Base** | `#0B0F17` | `bg-slate-950` / Pitch Dark | Main App Background |
| **Surface Accent** | `#1E293B` | `bg-slate-800` / Locker Room | Card & Container Backgrounds |
| **Football Neon** | `#22C55E` | `text-emerald-500` / Turf Green | Primary Actions, Buttons, Highlights |
| **Secondary Energy** | `#F59E0B` | `text-amber-500` / Flame Gold | Streaks, Badges, Workout Alerts |
| **Text Primary** | `#F8FAFC` | `text-slate-50` | Headings & Important Text |
| **Text Secondary** | `#94A3B8` | `text-slate-400` | Subtitles, Drill Details, Labels |

---

## 3. High-Level User Journey & Routes

1. **Landing Page (`/`)**: High-energy hero section showcasing football home-training routines, category highlights (Agility, Dribbling, Stamina), feature teasers, and CTAs ("Start Training", "Sign In").
2. **Authentication Page (`/auth`)**: Dual-mode login/signup interface with validation and token generation.
3. **User Dashboard (`/dashboard`)**: Central hub displaying active training streaks, weekly progress metrics, recommended daily drills, and position-specific modules.
4. **Interactive App (`/app/workout`)**: Active workout module featuring step-by-step video/graphic guides, drill timers, set counters, and workout completion logs.

---

## 4. Frontend & Backend Technical Architecture

### 4.1. Frontend Stack (React)
- **Library**: React.js (Vite / CRA)
- **Styling**: Tailwind CSS + Lucide React Icons
- **State & Router**: React Router DOM v6, React Context API / Zustand for active workout timers and user session management.

### 4.2. Backend API Stack (Node.js & Express)
- **Runtime**: Node.js with Express.js
- **Auth Strategy**: JSON Web Tokens (JWT) stored securely or sent via Bearer Headers
- **Middleware**: `authMiddleware.js` verifying access tokens for protected dashboard and workout endpoints.

---

## 5. Database Schema (MongoDB / PostgreSQL)

### 5.1. User Schema
```json
{
  "_id": "ObjectId / UUID",
  "fullName": "String",
  "email": "String (Unique)",
  "passwordHash": "String",
  "preferredPosition": "String (e.g. Winger, Striker, Midfielder, Defender)",
  "fitnessLevel": "String (Beginner, Intermediate, Advanced)",
  "createdAt": "Timestamp"
}
```

### 5.2. Workout Drill Schema
```json
{
  "_id": "ObjectId / UUID",
  "title": "String (e.g. Cone Weave & Explode)",
  "category": "String (Agility, Dribbling, Passing, Stamina)",
  "durationMinutes": 15,
  "difficulty": "String",
  "videoUrl": "String",
  "equipmentNeeded": ["Cones", "Football", "Mat"]
}
```

### 5.3. User Progress Log Schema
```json
{
  "_id": "ObjectId / UUID",
  "userId": "ObjectId (Ref: User)",
  "workoutId": "ObjectId (Ref: Workout)",
  "completedAt": "Timestamp",
  "intensityRating": 4,
  "notes": "Completed 5 full sets"
}
```

---

## 6. Prompt for Coding Chatbot

Copy and paste the exact prompt below into your coding AI assistant while working inside your VS Code workspace:

```text
PROMPT FOR CHATBOT:
--------------------------------------------------------------------
You are a Senior Full-Stack Engineer. I am working inside my VS Code project folder titled "geraldfit".

In the root of this folder, there is an architecture specification file named `geraldfit_architecture.md`.

Please read and parse `geraldfit_architecture.md` from my project directory carefully. Based strictly on its contents, generate the complete code for the "Geraldfit" application.

Follow these specific requirements:

1. Directory Structure:
   - Separate the code into a `client` (React.js + Tailwind CSS) folder and a `server` (Node.js + Express) folder.

2. Frontend Requirements (React):
   - Use the color palette from Section 2 (#0B0F17 pitch dark background, #22C55E turf green accents, #F59E0B gold streak badges).
   - Create the Landing Page (`/`) with football branding and call-to-actions.
   - Create the Auth Page (`/auth`) with login and signup state toggles.
   - Create the Player Dashboard (`/dashboard`) showing workout streaks, position selection, and drill preview cards.
   - Create the Interactive Training Page (`/app/workout`) with an active timer and drill step toggles.

3. Backend Requirements (Node.js/Express):
   - Provide the Express REST API setup with routes:
     - Auth: `POST /api/auth/register`, `POST /api/auth/login`
     - Workouts: `GET /api/workouts`, `GET /api/workouts/:id`
     - Progress: `POST /api/progress`, `GET /api/progress/:userId`
   - Include JWT verification middleware for protected routes.
   - Include sample Mongoose/PostgreSQL schemas matching Section 5.

Generate complete, production-ready files with clean code formatting.
--------------------------------------------------------------------
```