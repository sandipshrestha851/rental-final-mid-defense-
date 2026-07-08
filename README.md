# Real-Time Chat System — Next.js + Node/Express + Socket.IO + MySQL (XAMPP)

A real-time 1-to-1 chat app.

- **Frontend:** Next.js (App Router, TypeScript, Tailwind) in a `src/app` layout with an atomic component structure (atoms / molecules / organisms)
- **Backend:** Node.js + Express + Socket.IO (replaces the old Python/Flask backend)
- **Database:** MySQL, via **XAMPP**
- **Auth:** JWT + bcrypt password hashing. **Registration** collects a full profile (name, email, phone, gender, date of birth, bio); **login** uses **email + password**. The only enforced sign-up rule is that the password and its confirmation match — everything else is stored as entered. No email verification.

The backend keeps the exact same REST + Socket.IO contract the frontend expects, so the two just work together.

```
chat-system/
├── next-frontend/     # Next.js app (UI)
└── node-backend/      # Node + Express + Socket.IO + MySQL API
```

---

## 1. Prerequisites

- **Node.js 18+** (LTS recommended) — <https://nodejs.org>
- **XAMPP** with MySQL running — <https://www.apachefriends.org>

---

## 2. Set up the database (XAMPP)

1. Open the **XAMPP Control Panel** and click **Start** next to **MySQL** (and Apache if you want phpMyAdmin).
2. You already created a database named **`room_rental`** — good. If not, open phpMyAdmin (<http://localhost/phpmyadmin>) and create it.

You do **not** need to create any tables. The backend creates the `users` and `messages` tables automatically the first time it starts.

> XAMPP's MySQL default credentials are user `root` with an **empty password** on port `3306`. The backend is preconfigured for exactly that. If yours differ, edit `node-backend/.env`.

---

## 3. Start the backend

```bash
cd node-backend
npm install
npm start
```

You should see:

```
Initializing database schema...
Database schema initialized successfully.
Starting server on port 8000...
REST + Socket.IO ready at http://localhost:8000
```

The API now runs on **http://localhost:8000**.

> Tip: `npm run dev` uses nodemon to auto-restart on file changes.

---

## 4. Start the frontend

Open a **second terminal**:

```bash
cd next-frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

The frontend already knows where the backend is via `next-frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. Try it out

1. Open <http://localhost:3000> and **Register** a user (e.g. `alice`).
2. Open a **second browser / incognito window**, register another user (e.g. `bob`).
3. Select the other user from the sidebar and start chatting — messages, typing indicators, and online status update in real time.

---

## Configuration (`node-backend/.env`)

| Variable      | Default        | Notes                                   |
| ------------- | -------------- | --------------------------------------- |
| `PORT`        | `8000`         | Backend port (matches `.env.local`)     |
| `DB_HOST`     | `127.0.0.1`    | XAMPP MySQL host                        |
| `DB_PORT`     | `3306`         | XAMPP MySQL port                        |
| `DB_USER`     | `root`         | XAMPP default user                      |
| `DB_PASSWORD` | *(empty)*      | XAMPP default is no password            |
| `DB_NAME`     | `room_rental`  | Your database                           |
| `JWT_SECRET`  | *(preset)*     | Change this for production              |

If you change `PORT`, also update `next-frontend/.env.local`.

---

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:3306`** → MySQL isn't running. Start it in the XAMPP Control Panel.
- **`Access denied for user 'root'`** → You set a MySQL password. Put it in `DB_PASSWORD` in `node-backend/.env`.
- **Frontend can't reach backend** → Make sure the backend is running on port 8000 and `next-frontend/.env.local` matches. Restart `npm run dev` after editing `.env.local`.
- **Port 8000 already in use** → Change `PORT` in `node-backend/.env` and `NEXT_PUBLIC_API_URL` in `next-frontend/.env.local`.

---

## What changed from the original

- The `python-flask-api/` folder was replaced by `node-backend/` (Express + Socket.IO).
- The database moved from TiDB Cloud to local **MySQL (XAMPP)**, database `room_rental`.
- Passwords are hashed with **bcrypt** (Node). Because the hashing scheme differs from the old Flask/Werkzeug hashes, start with a fresh database and register users again.
- The frontend is unchanged.

## API reference

REST:
- `POST /api/register` — `{ username, password }`
- `POST /api/login` — `{ username, password }` → `{ token, user }`
- `GET /api/users` — *(Bearer token)* → list of other users + online status
- `GET /api/messages/:otherUserId` — *(Bearer token)* → conversation history

Socket.IO (auth via `{ token }` handshake):
- Client → server: `send_message` `{ token, receiver_id, message }`, `typing` `{ token, receiver_id, is_typing }`
- Server → client: `new_message`, `user_status` `{ user_id, status }`, `user_typing` `{ sender_id, is_typing }`, `error`
