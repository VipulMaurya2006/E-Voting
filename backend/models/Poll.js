const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    party: { type: String, trim: true, default: "Independent" },
    votes: { type: Number, default: 0 },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["election", "poll"],
      default: "election",
    },
    candidates: {
      type: [candidateSchema],
      validate: [(arr) => arr.length >= 2, "Add at least two options"],
    },
    isOpen: { type: Boolean, default: true },
    endsAt: {
      type: Date,
      required: function () {
        return this.isNew;
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
