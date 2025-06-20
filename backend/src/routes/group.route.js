import {Router} from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { addMemberToGroup, createGroup, deleteGroup, editGroup, getGroupById, getGroups, getUserJoinedGroups } from "../controllers/group.controller.js";
import { upload } from "../utils/multer.js";


export const groupRouter = Router();
groupRouter.use(isAuthenticated);
groupRouter.use(errorMiddleware);
groupRouter.use(catchAsyncError);

groupRouter.post('/', upload.single('coverImage'), createGroup);
groupRouter.put('/', upload.single('coverImage'), editGroup);
groupRouter.delete('/', deleteGroup);
groupRouter.get('/:groupId', getGroupById);
groupRouter.get('/all', getGroups);
groupRouter.get('/userjoined', getUserJoinedGroups);
groupRouter.post('/addmember', addMemberToGroup);

