import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map(); // this map store the socketId of the user(userId -> socketId)
const roomSocketMap = new Map(); // this map store the socketId of the room(roomId -> socketId)

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
  }
  const roomId = socket.handshake.query.roomId;
  if (roomId) {
    roomSocketMap.set(roomId, socket.id);
  }

  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("disconnected");
    if (userId) {
      userSocketMap.delete(userId);
    }
    if (roomId) {
      roomSocketMap.delete(roomId);
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, server, io };
