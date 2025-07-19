import { Server } from "socket.io";
import express from "express";
import http from "http";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://studiq-jet.vercel.app",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map(); // this map store the socketId of the user(userId -> socketId)
const groupRoomPrefix = "group-";
const roomSocketMap = new Map();
const peerMap = new Map();

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

  //voice call socket events 
  socket.on("voiceCall:peerConnect", ({userId, peerId, groupId}) => {
    //store mapping of userId and peerd
    peerMap.set(userId, peerId);
    console.log("peerMap", peerMap);

    //join the group room if not already in it
    const roomId = `${groupRoomPrefix}${groupId}`;
    socket.join(roomId);
    console.log(`User with ID ${userId} joined room  ${roomId}`);

    //notify members that user joined
    socket
      .to(roomId)
      .emit("voiceCall:peerConnected", { userId, peerId });
  });

  //handle peer disconnection 
  socket.on("voiceCall:peerDisconnect", ({userId, groupId}) => {
    const peerId = peerMap.get(userId);
     const roomId = `${groupRoomPrefix}${groupId}`;
    //remove mapping of userId and peer
    peerMap.delete(userId);
    socket.to(roomId).emit("voiceCall:peerDisconnected", { userId });
  });

  //Get all connected peers in a group call 
  socket.on("voiceCall:getPeers", ({groupId}, callback) => {
    const roomId = `${groupRoomPrefix}${groupId}`;
    const room = io.sockets.adapter.rooms.get(roomId); // get all sockets in the room
    if(!room){
      callback({peers: []});
      return;
    }
    //get all peer IDs in this room 
    const peers = [];
    room.forEach((socketId) => {
       const clientSocket = io.sockets.sockets.get(socketId); // get the socket object
       const userId = userSocketMap.get(socketId);
       if(userId && peerMap.has(userId)){
         peers.push({
          userId,
          peerId: peerMap.get(userId)
         })
       }
    })

    callback({peers});
  })

  //TODO:signal when user is speaking

  //cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("disconnected");
    if (userId) {
      userSocketMap.delete(userId);
      peerMap.delete(userId);
    }
   
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, server, io };
