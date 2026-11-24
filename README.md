# Chat Backend

Node.js + TypeScript chat backend.

- **MySQL** (Sequelize) – users, chats, chat members
- **Firebase Firestore** – messages, read receipts, last seen

## Setup

```bash
npm install
cp .env.example .env      # fill your MySQL details
```

1. Create the database: `CREATE DATABASE chat_app;` (tables are created automatically on start)
2. Download the service account key from Firebase Console → Project settings → Service accounts → Generate new private key
3. Save it as `src/firebase/serviceAccountKey.json`
4. Run:

```bash
npm run dev
```

## Database design

**MySQL**

| Table | Columns |
|---|---|
| users | id, name, email (unique), created_at, updated_at |
| chats | id, pair_key (unique), created_at, updated_at |
| chat_members | id, chat_id → chats.id, user_id → users.id, created_at, updated_at — unique (chat_id, user_id) |

`users` and `chats` are many-to-many through `chat_members`.
`pair_key` is `smallerUserId_biggerUserId`, so the same two users always get the same chat.

**Firestore**

```
chats/{chatId}/messages/{messageId}   senderId, text, createdAt, readBy { userId: time }, isEdited, isDeleted
chats/{chatId}/lastSeen/{userId}      messageId, updatedAt
```

`createdAt` is a Firestore server timestamp, messages are ordered by it.

## APIs

| Method | URL | Body |
|---|---|---|
| POST | /user/create | `{ name, email }` |
| POST | /chat/create | `{ userAId, userBId }` |
| POST | /chat/:chatId/message/send | `{ senderId, text }` |
| GET | /chat/:chatId/messages?limit=50 | |
| POST | /chat/:chatId/message/:messageId/read | `{ userId }` |
| POST | /chat/:chatId/lastseen | `{ userId, messageId }` |
| GET | /user/:userId/chats | |
| PUT | /chat/:chatId/message/:messageId | `{ userId, text }` – edit |
| DELETE | /chat/:chatId/message/:messageId | `{ userId }` – delete |
