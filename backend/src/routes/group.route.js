import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import {
  addMemberToGroup,
  createGroup,
  deleteGroup,
  editGroup,
  getGroupById,
  getGroups,
  getUserJoinedGroups,
} from "../controllers/group.controller.js";
import { upload } from "../utils/multer.js";

export const groupRouter = Router();
groupRouter.use(isAuthenticated);

groupRouter.post("/", upload.single("coverImage"), createGroup);
groupRouter.put("/:groupId", upload.single("coverImage"), editGroup);
groupRouter.delete("/", deleteGroup);
groupRouter.get("/all", getGroups);
groupRouter.get("/userjoined", getUserJoinedGroups);
groupRouter.post("/addmember", addMemberToGroup);
groupRouter.get("/:groupId/get", getGroupById);
