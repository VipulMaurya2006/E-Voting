require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Poll = require("./models/Poll");
const Vote = require("./models/Vote");

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/college_evoting";
  await mongoose.connect(uri);

  await Vote.deleteMany({});
  await Poll.deleteMany({});
  await User.deleteMany({ role: "voter" });

  const password = await bcrypt.hash("student123", 10);
  await User.insertMany([
    {
      name: "Aisha Khan",
      email: "aisha@college.edu",
      studentId: "STU-1001",
      password,
      role: "voter",
    },
    {
      name: "Rohan Mehta",
      email: "rohan@college.edu",
      studentId: "STU-1002",
      password,
      role: "voter",
    },
  ]);

  const admin = await User.findOne({ role: "admin" });

  await Poll.create([
    {
      title: "Student Council President 2026",
      description: "Choose the next student council president for the academic year.",
      category: "election",
      isOpen: true,
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: admin?._id,
      candidates: [
        { name: "Priya Sharma", party: "Campus Unity", votes: 0 },
        { name: "Arjun Patel", party: "Forward Students", votes: 0 },
        { name: "Meera Joshi", party: "Independent", votes: 0 },
      ],
    },
    {
      title: "Should the library stay open until midnight during exams?",
      description: "A campus-wide opinion poll for the library committee.",
      category: "poll",
      isOpen: true,
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: admin?._id,
      candidates: [
        { name: "Yes, extend hours", party: "Support", votes: 0 },
        { name: "Keep current hours", party: "Neutral", votes: 0 },
        { name: "No, close earlier", party: "Oppose", votes: 0 },
      ],
    },
  ]);

  console.log("Sample students: aisha@college.edu / student123");
  console.log("                 rohan@college.edu / student123");
  console.log("Sample election and poll created.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
