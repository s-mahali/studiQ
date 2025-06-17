import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import ErrorHandler from "../middlewares/error.middleware.js";

export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { message } = req.body;

  let conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: message,
  });
  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([newMessage.save(), conversation.save()]);
  // socket.io for real time communication
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return res.status(200).json({
    success: true,
    message: "Message sent successfully",
  });
};

export const getMessage = async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  }).populate("messages");
  console.log("conversationMessage", conversation?.messages);
  if (!conversation) {
    return next(new ErrorHandler("conversation not found", 404));
  }
  return res.status(200).json({
    success: true,
    payload: conversation.messages || [],
    message: "Messages fetched successfully",
  });
};
