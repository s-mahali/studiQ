import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conversation: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Conversation"
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
