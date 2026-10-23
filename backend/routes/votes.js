const express = require("express");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { pollId, candidateId } = req.body;
    if (!pollId || !candidateId) {
      return res.status(400).json({ message: "Choose a poll and a candidate." });
    }

    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Election officers cannot vote." });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }
    if (!poll.isOpen) {
      return res.status(400).json({ message: "This poll is closed." });
    }
    if (poll.endsAt && poll.endsAt <= new Date()) {
      return res.status(400).json({ message: "The voting deadline for this poll has passed." });
    }

    const candidate = poll.candidates.id(candidateId);
    if (!candidate) {
      return res.status(400).json({ message: "That candidate is not on this ballot." });
    }

    const already = await Vote.findOne({ poll: poll._id, voter: req.user._id });
    if (already) {
      return res.status(400).json({ message: "You have already voted in this poll." });
    }

    try {
      await Vote.create({
        poll: poll._id,
        voter: req.user._id,
        candidateId: candidate._id,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "You have already voted in this poll." });
      }
      throw err;
    }

    candidate.votes += 1;
    await poll.save();

    const totalVotes = poll.candidates.reduce((sum, c) => sum + c.votes, 0);
    res.status(201).json({
      message: "Vote recorded.",
      poll: {
        ...poll.toObject(),
        totalVotes,
        votedCandidateId: String(candidate._id),
      },
    });
  } catch {
    res.status(500).json({ message: "Could not record your vote." });
  }
});

module.exports = router;
