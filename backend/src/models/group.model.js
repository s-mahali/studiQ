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

    coverImage: {
      url: {
        type: String,
      },
      fileId: {
        type: String,
      },
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
      },
    ],
    channels: [
      {
        name: {
          type: String,
          default: "General",
        },
        messages: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "Message",
        },
      },
    ],
    activeCall: {
      type: Boolean,
      default: false,
    },
    callParticipants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        audio: {
          type: Boolean,
          default: false,
        },
        video: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Group", groupSchema);
