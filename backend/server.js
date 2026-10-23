const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const authRoutes = require("./routes/auth");
const pollRoutes = require("./routes/polls");
const voteRoutes = require("./routes/votes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@college.edu").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await User.findOne({ email });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: "Election Officer",
    email,
    studentId: "ADMIN-001",
    password: hashed,
    role: "admin",
  });
  console.log(`Admin account ready: ${email} / ${password}`);
}

async function start() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/college_evoting";
  await mongoose.connect(uri);
  await ensureAdmin();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
