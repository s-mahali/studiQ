import {Router} from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { errorMiddleware } from "../middlewares/error.middleware";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware";
import { getMessage, sendMessage } from "../controllers/message.controller";

export const messageRouter = Router();
messageRouter.use(isAuthenticated);
messageRouter.use(errorMiddleware);
messageRouter.use(catchAsyncError);

messageRouter.post('/message/:id', sendMessage);
messageRouter.get('/message/:id', getMessage);
