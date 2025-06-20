import {Router} from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { getGroupMessage, getMessage, sendGroupMessage, sendMessage } from "../controllers/message.controller.js";

export const messageRouter = Router();
messageRouter.use(isAuthenticated);
messageRouter.use(errorMiddleware);
messageRouter.use(catchAsyncError);

messageRouter.post('/message/:id', sendMessage);
messageRouter.get('/message/:id', getMessage);
messageRouter.get('/message/group/:groupId/:cname', sendGroupMessage);
messageRouter.get('/message/group/:groupId/:cname', getGroupMessage);
