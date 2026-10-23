const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only election officers can do this." });
  }
  next();
}

module.exports = { auth, adminOnly };
