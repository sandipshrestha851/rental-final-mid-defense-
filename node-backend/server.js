// server.js
// Node.js + Express + Socket.IO backend for the real-time chat system.

require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const { pool, initDb } = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const PORT = parseInt(process.env.PORT || "8000", 10);

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ---------------------------------------------------------------------------
// In-memory online-user tracking.
// Maps user_id (number) -> Set of socket ids (string).
// ---------------------------------------------------------------------------
const onlineUsers = new Map();

function addOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

function removeOnline(socketId) {
  for (const [userId, sids] of onlineUsers.entries()) {
    if (sids.has(socketId)) {
      sids.delete(socketId);
      const wentOffline = sids.size === 0;
      if (wentOffline) onlineUsers.delete(userId);
      return { userId, wentOffline };
    }
  }
  return null;
}

function isOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
function signToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// Express middleware: require a valid Bearer token.
function tokenRequired(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  let token = null;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user_id;
    req.email = decoded.email;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Token is invalid" });
  }
}

// Decode a token from a socket handshake (auth object or query string).
function verifySocketToken(socket) {
  let token =
    (socket.handshake.auth && socket.handshake.auth.token) ||
    (socket.handshake.query && socket.handshake.query.token) ||
    null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.user_id;
  } catch (err) {
    return null;
  }
}

// Normalize an empty string to NULL so optional columns stay clean.
function orNull(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

// ---------------------------------------------------------------------------
// REST ENDPOINTS
// ---------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Chat backend (Node.js) is running" });
});

// Register — collects the full profile and stores it as-is.
// The only structural requirements are email + password (needed for login).
// Password/confirm matching is validated on the client.
app.post("/api/register", async (req, res) => {
  const data = req.body || {};

  const full_name = orNull(data.full_name);
  const email = data.email ? String(data.email).trim().toLowerCase() : "";
  const password = data.password ? String(data.password) : "";
  const phone = orNull(data.phone);
  const gender = orNull(data.gender);
  const date_of_birth = orNull(data.date_of_birth);
  const bio = orNull(data.bio);
  const role = orNull(data.role);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users
        (full_name, email, phone, gender, date_of_birth, bio, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, gender, date_of_birth, bio, role, hashedPw]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Login — authenticate with email + password.
app.post("/api/login", async (req, res) => {
  const data = req.body || {};
  const email = data.email ? String(data.email).trim().toLowerCase() : "";
  const password = data.password ? String(data.password) : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// List all users (except current), with online status.
app.get("/api/users", tokenRequired, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, email, phone, gender, bio, created_at
       FROM users
       WHERE id != ?
       ORDER BY full_name ASC`,
      [req.userId]
    );

    const result = users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      gender: u.gender,
      bio: u.bio,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
      is_online: isOnline(u.id),
    }));

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Fetch conversation history between current user and another user.
app.get("/api/messages/:otherUserId", tokenRequired, async (req, res) => {
  const otherUserId = parseInt(req.params.otherUserId, 10);
  if (Number.isNaN(otherUserId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const [messages] = await pool.query(
      `SELECT id, sender_id, receiver_id, message, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [req.userId, otherUserId, otherUserId, req.userId]
    );

    const result = messages.map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      message: m.message,
      created_at: m.created_at ? new Date(m.created_at).toISOString() : null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ---------------------------------------------------------------------------
// SOCKET.IO HANDLERS
// ---------------------------------------------------------------------------

io.use((socket, next) => {
  const userId = verifySocketToken(socket);
  if (!userId) {
    console.log("Socket connection rejected: Invalid Token");
    return next(new Error("Unauthorized"));
  }
  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  addOnline(userId, socket.id);
  socket.join(`user_${userId}`);
  console.log(`User ${userId} connected on socket ${socket.id}`);

  io.emit("user_status", { user_id: userId, status: "online" });

  // Send a message (persist + deliver to both parties).
  socket.on("send_message", async (data = {}) => {
    let senderId;
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      senderId = decoded.user_id;
    } catch (err) {
      socket.emit("error", { message: "Unauthorized token" });
      return;
    }

    const receiverId = data.receiver_id;
    const messageText = (data.message || "").trim();
    if (!receiverId || !messageText) return;

    try {
      const [result] = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
        [senderId, receiverId, messageText]
      );

      const payload = {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        message: messageText,
        created_at: new Date().toISOString(),
      };

      io.to(`user_${receiverId}`).emit("new_message", payload);
      io.to(`user_${senderId}`).emit("new_message", payload);
    } catch (err) {
      socket.emit("error", { message: `Failed to send message: ${err.message}` });
    }
  });

  // Typing indicator relay.
  socket.on("typing", (data = {}) => {
    let senderId;
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      senderId = decoded.user_id;
    } catch (err) {
      return;
    }

    const receiverId = data.receiver_id;
    const isTyping = Boolean(data.is_typing);

    if (receiverId) {
      io.to(`user_${receiverId}`).emit("user_typing", {
        sender_id: senderId,
        is_typing: isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    const info = removeOnline(socket.id);
    if (info) {
      console.log(`User ${info.userId} disconnected from socket ${socket.id}`);
      if (info.wentOffline) {
        io.emit("user_status", { user_id: info.userId, status: "offline" });
      }
    }
  });
});

// ---------------------------------------------------------------------------
// START
// ---------------------------------------------------------------------------
(async () => {
  try {
    await initDb();
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Starting server on port ${PORT}...`);
      console.log(`REST + Socket.IO ready at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    console.error(
      "Make sure MySQL (XAMPP) is running and the credentials in .env are correct."
    );
    process.exit(1);
  }
})();
