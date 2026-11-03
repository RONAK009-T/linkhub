# LinkHub – Legal Social Chat, Gaming & Entertainment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue.svg)](https://linkhub.netlify.app)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052-black.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101.svg)](https://socket.io)

LinkHub is a modern, responsive, legal social chat, online gaming, and curated resource platform built with **React Native (Expo)**, **Node.js**, **Express.js**, and **MySQL**. It features self-destructing 60-second temporary chats, Google authentication, legal free entertainment streaming links, web games, PC gaming tools, and developer utilities.

---

## 🌟 Key Highlights & Features

### 1. Temporary Social Chat System (Strict 60-Second Server-Side Purge)
- **1-on-1 Direct Messaging & Group Lounges**: Connect in real time using WebSocket (`Socket.IO`).
- **Strict Server-Side Expiration**: Messages automatically expire 60 seconds after transmission. An automated server worker daemon cleans up expired records from the MySQL database every 2 seconds.
- **API Guard**: Expired messages cannot be fetched through APIs.
- **Visual Countdown Progress**: Each message bubble features an animated countdown indicator and progress bar.
- **User Safety**: Instant message deletion, conversation history clearing, user blocking, and message reporting.
- **Screenshot Warning**: Informs users that recipients may take external screenshots or photographs.

### 2. Google Services Integration
- **Google OAuth**: Fast, secure sign-in and sign-up with synchronized Google profile photos and display names.
- **Google Search**: Quick in-app web search modal directly accessible from the header.
- **Google Maps**: One-tap discovery of nearby gaming hubs, esports arenas, and cybercafes.
- **Google Analytics**: Explicit opt-in telemetry consent mechanism complying with DPDPA 2023.
- **Google AdMob**: Android banner ad slots with user-first, non-intrusive placement.

### 3. Curated Legal Resource Directories
- **Website 1: 1900–2050 (FMHY)** (`https://fmhy.net/`): Curated directory of free media, tools, and education.
- **Website 2: PC Game (Koyso)** (`https://koyso.net/`): PC gaming guides, reviews, and setup tips.
- **Website 3: All Activity (Toolhunt)** (`https://toolhunt.io/`): Daily updated SaaS tools and creator utilities.
- **Website 4: Poki** (`https://poki.com/`): Instant-play web games with zero installation.
- **Free Legal Movies**: Curated streaming hubs (Internet Archive, Tubi TV, Pluto TV, YouTube Free Movies, Plex Free, PBS Frontline).
- **Online & PC Gaming**: Instant web games, RetroArch, Open Source Game Clones, Chess.com, and Sudoku.
- **AI & Productivity Tools**: Hugging Face, DevDocs, Excalidraw, Photopea, CyberChef, and VirusTotal.

### 4. Admin Moderation & Community Safety
- **Real-Time Analytics**: Total registered users, online presence, active lounges, and pending reports.
- **Link Management**: Full admin CRUD capabilities (Add, Edit, Delete, Feature, Badge).
- **User Moderation**: Suspend / ban abusive accounts, promote or demote moderators.
- **Content Moderation**: Review user-submitted reports for links, messages, and accounts.
- **Statutory Grievance Redressal**: Built-in ticketing system compliant with Indian IT Intermediary Rules.

### 5. Legal & Privacy Compliance
- **Digital Personal Data Protection Act, 2023 (DPDPA)**: Documented consent records, data minimization, right to erasure, and privacy policy templates.
- **Indian IT Intermediary Guidelines**: Designated Grievance Officer details, notice-and-takedown workflow.
- **Copyright Protection**: Strict policy prohibiting pirated downloads, cracked software, or unauthorized media distribution.

---

## 🎨 Design & UI Theme

- **Background**: Obsidian Black (`#090B10`)
- **Secondary Background**: Deep Space Navy (`#121827`)
- **Primary Accent**: High-Voltage Neon Green (`#00F5A0`)
- **Secondary Accent**: Electric Purple (`#8B5CF6`)
- **Accent Cyan**: Cyber Cyan (`#00D2FF`)
- **Text**: Pure White (`#FFFFFF`) & Slate Gray (`#A0A7B4`)
- **Themes**: Support for Dark Mode and Light Mode.

---

## 🏗️ Architecture & Project Structure

```
linkhub/
├── backend/                       # Node.js + Express API & Socket.IO
│   ├── src/
│   │   ├── config/                # Database pool, JWT, Google OAuth & fallback store
│   │   ├── controllers/           # Auth, Chat, Links, Admin, Compliance
│   │   ├── middleware/            # Auth, AdminAuth, Rate Limiting
│   │   ├── routes/                # auth, chat, links, admin, compliance
│   │   ├── services/              # 60-second message cleanup daemon
│   │   ├── socket/                # Socket.IO temporary chat event handlers
│   │   └── server.js              # Application entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── railway.json
│   └── render.yaml
│
├── frontend/                      # React Native + Expo (Web & Android)
│   ├── app/                       # Expo Router navigation
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Home dashboard
│   │   │   ├── chat.tsx           # Temporary chat list & search users
│   │   │   ├── explore.tsx        # Entertainment, Movies & Tools
│   │   │   ├── games.tsx          # Poki, Koyso & Gaming dashboard
│   │   │   └── profile.tsx        # Profile, Bookmarks & Settings
│   │   ├── chat/[id].tsx          # 60s temporary message room
│   │   ├── auth/                  # Login, Register, Forgot Password
│   │   └── admin/index.tsx        # Admin Moderation Hub
│   ├── src/
│   │   ├── components/            # Header, CountdownTimer, ResourceCard, MessageBubble...
│   │   ├── context/               # AuthContext, ChatContext, ThemeContext
│   │   ├── services/              # API client, Socket.IO, Google OAuth, Google Services
│   │   └── theme/                 # Dark & Light gaming palette
│   ├── netlify.toml               # Netlify build & redirect configuration
│   ├── eas.json                   # EAS Build config for Android APK & AAB
│   └── app.json                   # Expo application manifest
│
├── database/
│   ├── schema.sql                 # Complete MySQL DDL schema
│   └── seed.sql                   # Curated resources, categories & demo users
│
├── documentation/
│   ├── API_DOCUMENTATION.md       # Complete REST & WebSocket specification
│   ├── INSTALLATION_GUIDE.md      # Detailed local setup steps
│   ├── DEPLOYMENT_GUIDE.md        # Netlify, Railway, Render, EAS instructions
│   ├── PRIVACY_POLICY.md          # DPDPA 2023 compliant privacy policy template
│   └── TERMS_AND_CONDITIONS.md    # Intermediary guidelines & terms template
│
├── docker-compose.yml             # Local containerized MySQL + API runner
└── package.json                   # Monorepo management scripts
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm start
```
*Note: If local MySQL is not running, LinkHub activates an In-Memory Development Store with all schemas and seed data so you can test immediately without setup hurdles!*

### 2. Frontend Setup (Expo Web)
```bash
cd frontend
npm install
npm run web
```
Open [http://localhost:8081](http://localhost:8081) in your browser.

### 3. Demo Credentials
| Role | Identifier | Password | Access |
|---|---|---|---|
| **Administrator** | `admin` or `admin@linkhub.com` | `Admin@12345` | Full Admin Hub, Link CRUD, User Ban/Demote |
| **Demo User** | `alex_gamer` or `alex@linkhub.com` | `Admin@12345` | Real-Time 60s Chat, Bookmarks, Lounges |

---

## 🚢 Deployment Overview

### Web to Netlify
1. Connect repository to Netlify.
2. Base directory: `frontend`. Build command: `npm run build:web`. Publish directory: `dist`.
3. Add `EXPO_PUBLIC_API_URL` environment variable.

### Backend to Railway / Render
1. Connect repository. Base directory: `backend`. Start command: `npm start`.
2. Connect Managed MySQL database and set `DATABASE_URL`.
3. Set `JWT_SECRET`, `NODE_ENV=production`.

### Android via Expo EAS
```bash
cd frontend
# Sideloadable APK for device testing:
eas build -p android --profile preview

# Production AAB for Google Play Console:
eas build -p android --profile production
```

---

## ⚖️ Legal & Copyright Advisory

LinkHub acts solely as an intermediary and directory indexing publicly accessible internet destinations. LinkHub does not host, mirror, or distribute third-party media or cracked software. To report any concerns, contact the Grievance Officer at `grievance@linkhub.com`.
