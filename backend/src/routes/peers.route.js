import express from "express";
import {isAuthenticated} from "../middlewares/auth.middleware.js";
import { acceptFriendRequest, getAllPeers, sendFriendRequest } from "../controllers/peers.controller.js";

export const peersRouter = express.Router();
peersRouter.get("/getpeers", isAuthenticated, getAllPeers);
peersRouter.post("/sendrequest", isAuthenticated, sendFriendRequest);
peersRouter.put("/acceptrequest", isAuthenticated, acceptFriendRequest);
