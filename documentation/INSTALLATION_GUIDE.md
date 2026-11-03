# LinkHub – Local Installation & Setup Guide

This guide walks through configuring and running the **LinkHub** full-stack application (Expo Web/Mobile + Express + MySQL + Socket.IO) on your machine.

---

## 1. Prerequisites

- **Node.js**: v18 or v20+ recommended (Node v22 verified)
- **npm** or **yarn**
- **MySQL Server** (optional for local testing: LinkHub automatically includes an in-memory SQL fallback store if MySQL is not started yet)
- **Expo CLI** (`npm install -g expo-cli` or via `npx expo`)

---

## 2. Directory Structure

```
linkhub/
├── backend/          # Node.js + Express + Socket.IO + MySQL API
├── frontend/         # React Native + Expo (Web + Android)
├── database/         # schema.sql and seed.sql
├── documentation/    # Comprehensive architectural & compliance docs
└── package.json      # Monorepo root runner
```

---

## 3. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Key configuration variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=linkhub_dev_secret_jwt_key_9934812398472394823904
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=linkhub_db
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Initialize MySQL database (Optional if using live MySQL)**:
   ```bash
   npm run db:init
   ```
   *Note: If local MySQL is not running, LinkHub seamlessly falls back to its In-Memory Development Store so you can develop and test immediately.*

5. **Start backend API & Socket server**:
   ```bash
   npm start
   # or with live reloading:
   npm run dev
   ```
   The backend will be running on `http://localhost:5000`.

---

## 4. Frontend Setup (Expo Web & Android)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Configure environment variables**:
   Create or edit `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run on Web**:
   ```bash
   npm run web
   # or
   npx expo start --web
   ```
   Open your browser at `http://localhost:8081`.

5. **Run on Android**:
   ```bash
   npx expo start --android
   ```
   *(Ensure Android Emulator is running or connect an Android device with USB debugging enabled).*

---

## 5. Demo Accounts

For testing the temporary chat, admin dashboard, and moderation:

- **Admin Account**:
  - Email / Username: `admin` or `admin@linkhub.com`
  - Password: `Admin@12345`
  - Capabilities: Full access to the Admin Moderation Hub, link management, user ban/unban.

- **Demo User Account**:
  - Email / Username: `alex_gamer` or `alex@linkhub.com`
  - Password: `Admin@12345`

- **Google Sign-In**:
  - Click "Continue with Google" on Web or Android to authenticate via Google OAuth.
