import express from "express";
import { connectdb } from "./db/connectdb.js";
import { userRouter } from "./routes/user.route.js";
import {app, server} from "./socket/socket.js"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { removeUnverifiedAccount } from "./automation/removeUnverifiedAccount.js";
import { peersRouter } from "./routes/peers.route.js";
import { userProfileRouter } from "./routes/userprofile.route.js";
import { messageRouter } from "./routes/message.route.js";
import { groupRouter } from "./routes/group.route.js";
dotenv.config();


const PORT = process.env.PORT || 8080;
connectdb(); // Connect to the database

// Middleware to parse JSON requests
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded requests
app.use(cookieParser()); // Middleware to parse cookies

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/user", userRouter);
app.use("/api/peers", peersRouter);
app.use("/api/userprofile", userProfileRouter);
app.use("/api/chat", messageRouter);
app.use("/api/group", groupRouter);

removeUnverifiedAccount(); // Start the cron job to remove unverified accounts

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
