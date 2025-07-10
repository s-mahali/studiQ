import { Server } from "socket.io";
import express from "express";
import http from "http";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map(); // this map store the socketId of the user(userId -> socketId)
const groupRoomPrefix = "group-";
const roomSocketMap = new Map();

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
    console.log(`User connected: UserID: ${userId}, SocketID: ${socket.id}`);
    
  }
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

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

  

  socket.on("disconnect", () => {
    console.log("disconnected");
    if (userId) {
      userSocketMap.delete(userId);
    }
   
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, server, io };
