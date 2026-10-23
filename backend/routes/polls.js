const express = require("express");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

function withTotals(poll, votedCandidateId = null) {
  const obj = poll.toObject();
  const totalVotes = obj.candidates.reduce((sum, c) => sum + c.votes, 0);
  const hasEnded = obj.endsAt && new Date(obj.endsAt) <= new Date();
  return { ...obj, isOpen: obj.isOpen && !hasEnded, totalVotes, votedCandidateId };
}

router.get("/", auth, async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    const votes = await Vote.find({ voter: req.user._id });
    const votedMap = Object.fromEntries(
      votes.map((v) => [String(v.poll), String(v.candidateId)])
    );

    res.json(
      polls.map((p) => withTotals(p, votedMap[String(p._id)] || null))
    );
  } catch {
    res.status(500).json({ message: "Could not load polls." });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }
    const vote = await Vote.findOne({ poll: poll._id, voter: req.user._id });
    res.json(withTotals(poll, vote ? String(vote.candidateId) : null));
  } catch {
    res.status(500).json({ message: "Could not load this poll." });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { title, description, category, candidates, endsAt } = req.body;
    if (!title || !Array.isArray(candidates) || candidates.length < 2) {
      return res.status(400).json({
        message: "A title and at least two candidates/options are required.",
      });
    }

    const closingTime = new Date(endsAt);
    if (!endsAt || Number.isNaN(closingTime.getTime()) || closingTime <= new Date()) {
      return res.status(400).json({
        message: "Choose a valid end date and time in the future.",
      });
    }

    const cleaned = candidates
      .map((c) => ({
        name: String(c.name || "").trim(),
        party: String(c.party || "Independent").trim() || "Independent",
        votes: 0,
      }))
      .filter((c) => c.name);

    if (cleaned.length < 2) {
      return res.status(400).json({ message: "Name at least two candidates." });
    }

    const poll = await Poll.create({
      title: title.trim(),
      description: (description || "").trim(),
      category: category === "poll" ? "poll" : "election",
      candidates: cleaned,
      endsAt: closingTime,
      createdBy: req.user._id,
    });

    res.status(201).json(withTotals(poll));
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not create poll." });
  }
});

router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }
    if (typeof req.body.isOpen !== "boolean") {
      return res.status(400).json({ message: "Choose whether the poll should be open." });
    }
    if (req.body.isOpen && poll.endsAt && poll.endsAt <= new Date()) {
      return res.status(400).json({ message: "This poll's end time has passed." });
    }
    poll.isOpen = req.body.isOpen;
    await poll.save();
    res.json(withTotals(poll));
  } catch {
    res.status(500).json({ message: "Could not update poll." });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }
    await Vote.deleteMany({ poll: poll._id });
    res.json({ message: "Poll removed." });
  } catch {
    res.status(500).json({ message: "Could not delete poll." });
  }
});

module.exports = router;
