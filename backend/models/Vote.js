const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

voteSchema.index({ poll: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
