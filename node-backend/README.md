# node-backend

Node.js + Express + Socket.IO + MySQL backend for the chat system.

## Run

```bash
npm install
npm start        # or: npm run dev  (nodemon)
```

Requires MySQL running (XAMPP) and a database named `room_rental` (see `.env`).
Tables are created automatically on first start.

## Files

- `server.js` — Express REST endpoints + Socket.IO handlers + startup
- `db.js` — MySQL connection pool (`mysql2`) and schema initialization
- `.env` — configuration (copy of `.env.example`)

## Stack

- `express` — HTTP server / REST
- `socket.io` — real-time messaging
- `mysql2` — MySQL driver (connection pool, prepared statements)
- `jsonwebtoken` — JWT auth
- `bcryptjs` — password hashing
- `cors`, `dotenv`
