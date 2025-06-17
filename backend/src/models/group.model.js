import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    chat: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Group", groupSchema);
