import express from 'express';
import {isAuthenticated} from '../middlewares/auth.middleware.js';
import { updateUserProfile, uploadProfilePic } from '../controllers/userprofile.controller.js';
import {upload} from '../controllers/userprofile.controller.js';

export const userProfileRouter = express.Router();
userProfileRouter.patch('/updateprofile/', isAuthenticated,  updateUserProfile)
userProfileRouter.patch('/uploadpfp/', isAuthenticated, upload.single('profilePicture'), uploadProfilePic)