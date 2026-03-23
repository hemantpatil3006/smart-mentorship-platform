# 🚀 Deployment Guide

This document outlines how to deploy the **1-on-1 Mentorship Platform** into a live production environment.

Because this project utilizes WebSockets alongside standard HTTP, the Frontend (Next.js) and Backend (Node+Express+Socket.io) must be deployed as separate services.

---

## 🏗️ 1. Deploy the Backend (Railway / Render)
We recommend **Railway** or **Render** for the backend because they natively support WebSockets seamlessly out of the box.

### Railway Deployment (Recommended)
1. Push your code to GitHub.
2. Create an account on [Railway.app](https://railway.app/).
3. Click **New Project** -> **Deploy from GitHub repo**.
4. Select your Mentorship Platform repository.
5. Railway will automatically detect the Node.js backend if you specify the root directory to be `/backend` (or if deployed as a monorepo, set the Root Directory in settings).
6. **Environment Variables**: Head to the Variables tab and add:
   - `PORT` (Usually Railway provides this, but set to `5000`).
   - `SUPABASE_URL` (Your Supabase project URL).
   - `SUPABASE_SERVICE_ROLE_KEY` (Your Supabase service role secret).
7. Wait for the build. Once live, Railway will give you a domain (e.g., `mentorship-backend-production.up.railway.app`). **Copy this URL**.

### Render Deployment (Alternative)
1.  Push your code to GitHub.
2.  Login to [Render.com](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Set the following configuration:
    -   **Name**: `mentorship-backend`
    -   **Root Directory**: `backend`
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm start`
6.  **Environment Variables**: Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
7.  Click **Create Web Service**.

---

## 🌐 2. Deploy the Frontend (Vercel)
Vercel is the creator of Next.js and the absolute best place to host the frontend.

1. Go to [Vercel.com](https://vercel.com/) and connect your GitHub.
2. Click **Add New Project** and import your repository.
3. In the "Framework Preset" it should auto-detect **Next.js**.
4. Important: Set the **Root Directory** to `frontend/`.
5. **Environment Variables**: Open the Environment Variables section and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Public Key)
   - `NEXT_PUBLIC_API_URL`: (Paste the live backend URL you got from Render/Railway!)
   - `NEXT_PUBLIC_SOCKET_URL`: (Paste the live backend URL you got from Render/Railway!)
6. Click **Deploy**.

---

## 🗄️ 3. Post-Deployment Checks

**CORS Settings**: 
By default, the backend Socket.io is likely configured with `cors: { origin: '*' }` or specific localhost ports. If you restricted CORS in `backend/src/socket/index.ts`, ensure you add your Vercel domain to the allowed origins array!

**Supabase Auth Redirects**:
Head to your Supabase Dashboard -> Authentication -> URL Configuration. Add your live Vercel Domain to the **Site URL** and **Redirect URLs** so Supabase knows it is allowed to process logins from your production site.
