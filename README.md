# One-On-One Mentorship Platform

A full-stack, real-time mentorship platform designed to connect Mentors and Students. The platform enables mentors to generate one-time session links for students, instantly placing them into a live Room equipped with **WebRTC 1-on-1 Video Calling**, a **Shared Monaco Code Editor (real-time sync)**, and a **Persistent Chat System**.

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons, `@monaco-editor/react`
- **Backend:** Node.js, Express, TypeScript, `socket.io`
- **Database / Auth:** Supabase (PostgreSQL), Next.js Middleware Auth, Row Level Security (RLS)
- **Real-Time Engine:** WebRTC (Peer-to-Peer AV) & Socket.io (Signaling & Code/Chat Sync)

---

## ✨ Core Features

1. **Role-based Authentication**
   * Users sign up as either a **Mentor** or **Student**.
   * Protected routes managed cleanly via Next.js Middleware.

2. **Session Management (Dashboard)**
   * Mentors type a student's email to generate an encrypted UUID session link.
   * Auto-refreshing dashboard alerts students to incoming session requests.
   * Secure Supabase RLS policies guarantee only the invited student can join the room.

3. **Live WebRTC Video & Audio**
   * Uses Google STUN servers for NAT Traversal.
   * Direct Peer-to-Peer streaming perfectly optimizing server load and latency.
   * Complete hardware control toggles (Microphone, Camera).

4. **Shared Monaco Code Editor**
   * VS Code-like editing experience fully synced via WebSockets.
   * "Last-write-wins" optimized throttling to protect the Node.js backend from spam.
   * 5 available languages (JavaScript, TypeScript, Python, HTML, CSS).

5. **Slide-Out Chat Panel**
   * Fast WebSocket message delivery.
   * Data persists forever into the Supabase database.

---

## 🛠️ Local Development Setup

### 1. Supabase Initialization
Create a project on [Supabase](https://supabase.com). In the SQL Editor, execute the database schema:

1. `profiles` schema and Trigger.
2. `sessions` schema and RLS Policies.
3. `messages` schema and RLS Policies.

### 2. Environment Variables
Create a `.env.local` inside `/frontend`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Create a `.env` inside `/backend`:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role
```

### 3. Run the Backend (Socket + Express Server)
```bash
cd backend
npm install
npm run dev
```

### 4. Run the Frontend (Next.js Application)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with your local platform.

---

*This project was developed strictly adhering to MVP (Minimum Viable Product) requirements: providing maximum utility and real-time reliability without introducing bloated CRDTs or complex multi-party SFU architecture.*
