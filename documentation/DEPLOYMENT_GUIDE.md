# LinkHub – Production Deployment Guide

This guide details deploying the LinkHub platform across:
1. **Frontend**: Netlify (Web SPA)
2. **Backend**: Railway / Render (Node.js + Socket.IO)
3. **Database**: Managed Cloud MySQL (Railway, Aiven, PlanetScale, or Render)
4. **Android**: Expo EAS Build (APK for testing, AAB for Google Play Store)

---

## 1. Web Frontend Deployment on Netlify

### Netlify Configuration
The repository includes `frontend/netlify.toml` and `frontend/public/_redirects`:
- **Build Command**: `npm run build:web` (`npx expo export -p web`)
- **Publish Directory**: `frontend/dist`
- **SPA Redirect**: `/* /index.html 200`

### Step-by-Step Netlify Setup
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project** (GitHub/GitLab).
3. Set the **Base directory** to `frontend`.
4. Set the **Build command** to `npm run build:web`.
5. Set the **Publish directory** to `frontend/dist`.
6. Add the following **Environment Variables** in Netlify Site Settings:
   - `EXPO_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://linkhub-backend.up.railway.app`)
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Your Google OAuth Web Client ID
7. Click **Deploy Site**. Netlify will build and deploy your React Native Web app with HTTPS enabled automatically.

---

## 2. Backend Deployment on Railway or Render

### Option A: Railway (Recommended for Socket.IO & MySQL)
1. Log in to [Railway.app](https://railway.app/).
2. Create a **New Project** > **Provision MySQL Database**.
3. Under the same project, click **New Service** > **GitHub Repo** > Select `linkhub`.
4. In Service Settings, configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Connect your MySQL Database:
   - Add reference variable `DATABASE_URL` pointing to the provisioned MySQL instance.
6. Configure required Environment Variables:
   - `PORT`: `5000` (Railway will provide `$PORT` automatically)
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a strong 64-character random string
   - `FRONTEND_URL`: Your Netlify URL (`https://linkhub.netlify.app`)
7. Execute `database/schema.sql` and `database/seed.sql` inside the Railway MySQL database console.

### Option B: Render Deployment
The repository includes `backend/render.yaml` for 1-click deployment on Render:
- Provisions Web Service running Node.js
- Configures health check path `/health`
- WebSocket support for Socket.IO enabled out of the box

---

## 3. Expo EAS Build for Android

LinkHub is configured with `eas.json` for Android APK and Google Play Store App Bundle (AAB).

### Step 1: Install EAS CLI & Log In
```bash
npm install -g eas-cli
eas login
```

### Step 2: Configure Project
In `frontend/`:
```bash
cd frontend
eas project:init
```

### Step 3: Build Android APK (for Direct Device Testing / Sideloading)
```bash
eas build -p android --profile preview
```
This generates a downloadable `.apk` file that can be installed on any physical Android phone or emulator.

### Step 4: Build Android AAB (for Google Play Console Release)
```bash
eas build -p android --profile production
```
This generates a signed `.aab` (Android App Bundle) ready to be uploaded to Google Play Console.

---

## 4. Google Play Store Compliance Checklist

When publishing LinkHub to the Google Play Store, verify:
1. **User Generated Content (UGC) Policy**:
   - LinkHub includes reporting functionality for abusive temporary messages and users.
   - LinkHub includes user blocking mechanism.
   - LinkHub includes active moderation and ban enforcement.
2. **Privacy Policy**:
   - Provide link to the hosted Privacy Policy (`documentation/PRIVACY_POLICY.md`).
3. **Data Safety Section**:
   - Disclose collection of account credentials (email, username).
   - Temporary messages are purged within 60 seconds and not stored permanently.
   - All data in transit is encrypted using HTTPS / TLS.
