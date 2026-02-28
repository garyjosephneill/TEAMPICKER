# SquadBalancer Deployment Guide

This app is a full-stack application built with **React (Vite)** and **Express**. It uses **SQLite** for data persistence.

## 🚀 How to Deploy

Since this app uses a local SQLite database, you need a host that supports **persistent storage**.

### Option 1: Railway (Recommended for SQLite)
Railway is the easiest way to deploy apps with a database.

1.  **Create a GitHub Repository**: Push your code to a new repository on GitHub.
2.  **Connect to Railway**:
    *   Go to [Railway.app](https://railway.app/) and create an account.
    *   Click **"New Project"** -> **"Deploy from GitHub repo"**.
    *   Select your repository.
3.  **Add Persistent Storage**:
    *   In your Railway project settings, go to **Volumes**.
    *   Create a new Volume (e.g., 1GB) and mount it to `/data`.
    *   Set an Environment Variable: `DATABASE_URL=/data/squad.db`.
4.  **Deploy**: Railway will automatically build and deploy your app.

### Option 2: Render
1.  Create a **Web Service** on [Render](https://render.com/).
2.  Connect your GitHub repo.
3.  Set the Build Command: `npm install && npm run build`.
4.  Set the Start Command: `node server.ts`.
5.  Add a **Disk** (Persistent Storage) in the settings and mount it to a folder, then update the DB path in `server.ts`.

---

## 🛠 Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure
- `src/`: Frontend React code.
- `server.ts`: Backend Express server and API.
- `squad.db`: SQLite database file (created automatically).
- `public/`: Static assets.
