import {Router} from "express"
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { getCallParticipants, joinGroupCall, leaveGroupCall, startGroupCall, toggleMedia } from "../controllers/voicecall.controller.js";

export const groupvcRouter = Router();
groupvcRouter.use(isAuthenticated);

groupvcRouter.post("/start/:groupId", startGroupCall);
groupvcRouter.post("/join/:groupId", joinGroupCall);
groupvcRouter.post("/leave/:groupId", leaveGroupCall);
groupvcRouter.post("/media/:groupId", toggleMedia);
groupvcRouter.get("/participants/:groupId", getCallParticipants);
