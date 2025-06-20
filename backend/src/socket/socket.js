import { Server } from "socket.io";
import express from "express";
import http from "http";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map(); // this map store the socketId of the user(userId -> socketId)
const groupRoomPrefix = "group-";
//const roomSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export const getRoomSocketId = (roomId) => {
  return roomSocketMap.get(roomId);
};

io.on("connection", (socket) => {
  console.log("connection established", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log("userSocketMap", userSocketMap);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  }

  socket.on("join-group", ({ groupId, userId }) => {
    const roomId = `${groupRoomPrefix}${groupId}`;
    socket.join(roomId);
    roomSocketMap.set(roomId, socket.id);
    console.log("roomSocketMap", roomSocketMap);
    console.log(`User with ID ${userId} joined group  ${groupId}`);

    //notify members that user joined
    socket
      .to(roomId)
      .emit("user-joined-group", { userId, groupId, joinedAt: Date.now() });
  });

  //Leave a group chat room
  socket.on("leave-group", ({ groupId, userId }) => {
    const roomId = `${groupRoomPrefix}${groupId}`;
    socket.leave(roomId);
    console.log(`User with ID ${userId} left group  ${groupId}`);
  });

  //send a message to group
  // socket.on(
  //   "group-message",
  //   async ({ groupId, channelName = "general", senderId, message }) => {
  //     try {
  //       const newMessage = await Message.create({
  //         sender: senderId,
  //         group: groupId,
  //         content: message.content,
  //       });
  //       const group = await Group.findById(groupId);
  //       if (!group) {
  //         socket.emit("error", { message: "Group not found" });
  //         return;
  //       }

  //       let channel = group.channels.find((c) => c.name === channelName);
  //       if (!channel) {
  //         group.channels.push({
  //           name: channelName,
  //           messages: [newMessage._id],
  //         });
  //       } else {
  //         channel.messages.push(newMessage._id);
  //       }

  //       await group.save();
  //       await newMessage.populate("sender", "username profilePicture");

  //       //broadcast the message to all users in the group room
  //       const roomId = `${groupRoomPrefix}${groupId}`;
  //       io.to(roomId).emit("new-group-message", {
  //         message: newMessage,
  //         groupId,
  //         channelName,
  //         sender: {
  //           id: newMessage.sender._id,
  //           username: newMessage.sender.username,
  //           profilePicture: newMessage.sender.profilePicture,
  //         },
  //       });
  //     } catch (error) {
  //        console.error("Error sending group Message", error);
  //        socket.emit("error",{
  //         message: "Failed to send Message"
  //        });
  //     }
  //   }
  // );

  socket.on("disconnect", () => {
    console.log("disconnected");
    if (userId) {
      userSocketMap.delete(userId);
    }
   
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, server, io };
