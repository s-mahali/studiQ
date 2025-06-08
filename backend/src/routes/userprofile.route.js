import express from 'express';
import {isAuthenticated} from '../middlewares/auth.middleware.js';
import { getUserProfileById, updateUserProfile, uploadProfilePic } from '../controllers/userprofile.controller.js';
import {upload} from '../controllers/userprofile.controller.js';

export const userProfileRouter = express.Router();
userProfileRouter.put('/profile', isAuthenticated,  updateUserProfile)
userProfileRouter.patch('/uploadpfp', isAuthenticated, upload.single('profilePicture'), uploadProfilePic)
userProfileRouter.get('/profile/:userId', isAuthenticated, getUserProfileById)