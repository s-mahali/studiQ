import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import Group from "../models/group.model.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";


export const sendMessage = catchAsyncError(async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { message } = req.body;
  console.log("message", message);

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
  })
   
  console.log("new Message malik", newMessage);
  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([newMessage.save(), conversation.save()]);
  await newMessage.populate([
    { path: "sender", select: "username profilePicture" },
    { path: "receiver", select: "username profilePicture" }
  ]);
  
  // socket.io for real time communication
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  console.log("...............", newMessage); 

  return res.status(200).json({
    success: true,
    message: "Message sent successfully",
    payload: newMessage,
  });

});

export const getMessage =  catchAsyncError(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  }).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "username profilePicture",
      }
  }).populate({
      path: "messages",
      populate: {
        path: "receiver",
        select: "username profilePicture",
      }
  })
  console.log("conversationMessage", conversation?.messages);
  if (!conversation) {
    return next(new ErrorHandler("conversation not found", 404));
  }
  return res.success(conversation.messages, "Messages fetched successfully");
});

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

export const getGroupMessage = async (req, res, next) => {
  const { groupId, channelName = "general" } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  const isMember = group.members.some(
    (member) => member.userId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return next(new ErrorHandler("Not authorized to get messages", 403));
  }

  const channel = group.channels.find((c) => c.name === channelName.trim());
  if (!channel) {
    return res.status(200).json({
      success: true,
      messages: [],
      totalCounts: 0,
    });
  }

  //Get Message with pagination
  const messageQuery = await Message.find({
    _id: {
      $in: channel.messages,
    },
  })
    .populate("sender", "username profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const countQuery = Message.countDocuments({
    _id: {
      $in: channel.messages,
    },
  });

  const [messages, totalCounts] = await Promise.all([messageQuery, countQuery]);

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalCounts,
  });
};
