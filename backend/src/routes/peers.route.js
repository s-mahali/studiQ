import express from "express";
import {isAuthenticated} from "../middlewares/auth.middleware.js";
import { acceptFriendRequest, getAllPeers, sendFriendRequest, suggestPeers } from "../controllers/peers.controller.js";

export const peersRouter = express.Router();
peersRouter.get("/suggestedpeers", isAuthenticated, suggestPeers)
peersRouter.get("/getpeers", isAuthenticated, getAllPeers);
peersRouter.post("/sendrequest", isAuthenticated, sendFriendRequest);
peersRouter.put("/acceptrequest", isAuthenticated, acceptFriendRequest);
