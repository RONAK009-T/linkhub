# LinkHub REST API & WebSocket Documentation

LinkHub is a real-time temporary social chat, legal entertainment, online gaming, and developer tools discovery platform.

- **Base URL**: `http://localhost:5000` (Local) / `https://your-backend.up.railway.app` (Production)
- **Protocol**: HTTP/1.1 & WebSocket (Socket.IO v4)
- **Authentication**: Bearer Token in `Authorization: Bearer <JWT_TOKEN>` header

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Body**:
  ```json
  {
    "username": "alex_gamer",
    "email": "alex@linkhub.com",
    "password": "Password@123",
    "display_name": "Alex Vance"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Account created successfully!",
    "token": "eyJhbGciOi...",
    "user": { "id": 2, "username": "alex_gamer", "email": "alex@linkhub.com", "role": "user" }
  }
  ```

### Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Body**: `{ "login": "alex_gamer", "password": "Password@123" }`
- **Response `200 OK`**: `{ "token": "...", "user": { ... } }`

### Google OAuth Login / Register
- **Method**: `POST`
- **Path**: `/api/auth/google`
- **Body**: `{ "idToken": "...", "accessToken": "..." }`
- **Response `200 OK`**: Authenticates user via Google, synchronizes profile photo, links account, and returns JWT.

### Password Recovery
- **POST** `/api/auth/forgot-password` (`{ "email": "user@linkhub.com" }`)
- **POST** `/api/auth/reset-password` (`{ "token": "...", "newPassword": "..." }`)

---

## 2. Temporary Real-Time Chat Endpoints

All chat endpoints require `Authorization: Bearer <TOKEN>`.

### Get User Conversations
- **Method**: `GET`
- **Path**: `/api/chat/conversations`
- **Response `200 OK`**: List of 1-to-1 conversations and group lounges, including live count of active temporary messages.

### Create Conversation
- **Method**: `POST`
- **Path**: `/api/chat/conversations`
- **Body for 1-to-1**: `{ "recipientId": 3 }`
- **Body for Group**: `{ "isGroup": true, "title": "Apex Squad", "participantIds": [2, 3, 4] }`

### Get Active Messages (Strict Server-Side 60s Expiration)
- **Method**: `GET`
- **Path**: `/api/chat/conversations/:id/messages`
- **Security Rule**: Stamped `expires_at = created_at + 60s`. Query automatically filters `WHERE expires_at > NOW() AND is_deleted = FALSE`. Expired messages cannot be fetched through the API.
- **Response `200 OK`**:
  ```json
  {
    "conversation_id": 1,
    "messages": [
      {
        "id": 101,
        "content": "Squad match starts in 2 minutes!",
        "sender_name": "Alex Vance",
        "created_at": "2026-11-03T10:00:00.000Z",
        "expires_at": "2026-11-03T10:01:00.000Z",
        "remaining_seconds": 42,
        "is_mine": true
      }
    ],
    "server_time": "2026-11-03T10:00:18.000Z"
  }
  ```

### Send Temporary Message
- **Method**: `POST`
- **Path**: `/api/chat/conversations/:id/messages`
- **Body**: `{ "content": "Hello temporary chat!" }`

### Delete Message Immediately
- **Method**: `DELETE`
- **Path**: `/api/chat/messages/:messageId`

### Clear Conversation
- **Method**: `DELETE`
- **Path**: `/api/chat/conversations/:id/messages`

### Block User / Unblock User
- **POST** `/api/chat/block/:userId`
- **DELETE** `/api/chat/block/:userId`
- **GET** `/api/chat/blocks`

### Report Message
- **POST** `/api/chat/report-message` (`{ "messageId": 101, "reason": "harassment", "details": "..." }`)

---

## 3. WebSocket Real-Time Events (Socket.IO)

Handshake requires `auth: { token: "<JWT>" }`.

### Client to Server Events
- `join_conversation` (`{ conversationId }`)
- `leave_conversation` (`{ conversationId }`)
- `send_message` (`{ conversationId, content }`)
- `delete_message` (`{ messageId, conversationId }`)
- `clear_conversation` (`{ conversationId }`)
- `typing_start` (`{ conversationId }`)
- `typing_stop` (`{ conversationId }`)

### Server to Client Events
- `new_message`: Delivered instantly with `remaining_seconds: 60` and `expires_at`.
- `messages_expired`: Broadcast by the 2000ms server worker whenever messages expire in MySQL.
- `message_deleted`: Instructs clients to remove message immediately.
- `conversation_cleared`: Clears screen for all participants.
- `chat_notification`: Triggers in-app banner alert if recipient is on another tab.
- `user_status_changed`: Broadcasts `{ userId, status: "online" | "offline" }`.

---

## 4. Website Links & Categories Endpoints

### List Website Links
- **GET** `/api/links?section=gaming&featured=true&search=poki`

### Featured Links
- FMHY (1900–2050): `https://fmhy.net/`
- PC Game (Koyso): `https://koyso.net/`
- All Activity (Toolhunt): `https://toolhunt.io/`
- Poki: `https://poki.com/`

### Bookmark / Favorite Link
- **POST** `/api/links/:id/favorite` (Toggles user bookmark)
- **GET** `/api/links/user/favorites`

### Report Suspicious Resource
- **POST** `/api/links/report` (`{ "reportedLinkId": 4, "reason": "...", "details": "..." }`)

---

## 5. Compliance & Statutory Grievance Endpoints

- **GET** `/api/compliance/info`: Returns details of Statutory Grievance Officer under Indian IT Rules.
- **POST** `/api/compliance/grievance`: Submit grievance ticket (generates tracking ticket `GRV-XXXX`).
- **GET** `/api/compliance/grievance/:ticketId`: Check status and resolution notes of grievance ticket.
- **POST** `/api/compliance/consent`: Record affirmative consent under DPDPA 2023.
