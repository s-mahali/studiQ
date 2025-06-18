import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import Group from "../models/group.model.js";

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

export const sendGroupMessage = async (req, res, next) => {
  const { groupId, channelName = "general" } = req.params;
  const { content } = req.body;
  const senderId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  //check if user is a member
  const isMember = group.members.some(
    (member) => member.userId.toString() === senderId.toString()
  );

  if (!isMember) {
    return next(new ErrorHandler("Not authorized to send messages", 403));
  }

  const newMessage = await Message.create({
    sender: senderId,
    content,
    group: groupId,
  });

  //find or create the channel
  let channel = group.channels.find((c) => c.name === channelName.trim());
  if (!channel) {
    group.channels.push({
      name: channelName,
      messages: [newMessage._id],
    });
  } else {
    channel.messages.push(newMessage._id);
  }

  await group.save();
  //Emit via socket if users currently not connected
  const io = req.app.get("io");
  const roomId = `group-${groupId}`;
  await newMessage.populate("sender", "username profilePicture");
  io.to(roomId).emit("new-group-message", {
    message: newMessage,
    groupId,
    channelName,
  });

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
  });
};
