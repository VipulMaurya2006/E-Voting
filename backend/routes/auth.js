const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, studentId, password } = req.body;
    if (!name || !email || !studentId || !password) {
      return res.status(400).json({ message: "Fill in all fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId: studentId.trim() }],
    });
    if (exists) {
      return res.status(400).json({ message: "Email or student ID already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId: studentId.trim(),
      password: hashed,
      role: "voter",
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Could not register. Try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Wrong email or password." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Wrong email or password." });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not log in. Try again." });
  }
});

router.get("/me", auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
