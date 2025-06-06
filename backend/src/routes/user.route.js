import express from 'express';
import { login, logout, register, verifyEmail } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

export const userRouter = express.Router();

userRouter.post('/signup', register);
userRouter.post('/verify',  verifyEmail);
userRouter.post('/login', login);
userRouter.get('/logout', logout);


