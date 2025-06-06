import express from "express";
import { connectdb } from "./db/connectdb.js";
import { userRouter } from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { removeUnverifiedAccount } from "./automation/removeUnverifiedAccount.js";
import { peersRouter } from "./routes/peers.route.js";
import { userProfileRouter } from "./routes/userprofile.route.js";
dotenv.config();

const app = express();
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

removeUnverifiedAccount(); // Start the cron job to remove unverified accounts

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
