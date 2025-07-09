import express from "express";
import {isAuthenticated} from "../middlewares/auth.middleware.js";
import { acceptFriendRequest, cancelSentFriendRequest, getAllPeers, getConnections, getIncomingFriendRequest, getSendFriendRequest, rejectFriendRequest, sendFriendRequest, suggestPeers } from "../controllers/peers.controller.js";

export const peersRouter = express.Router();
peersRouter.get("/suggestedpeers", isAuthenticated, suggestPeers);
peersRouter.get("/getpeers", isAuthenticated, getAllPeers);
peersRouter.post("/sendrequest", isAuthenticated, sendFriendRequest);
peersRouter.put("/acceptrequest", isAuthenticated, acceptFriendRequest);
peersRouter.get("/incoming-request", isAuthenticated, getIncomingFriendRequest);
peersRouter.get("/sent-request", isAuthenticated, getSendFriendRequest);
peersRouter.patch("/reject-request", isAuthenticated, rejectFriendRequest);
peersRouter.patch("/cancel-sent-request", isAuthenticated, cancelSentFriendRequest);
peersRouter.get("/connections", isAuthenticated, getConnections);
