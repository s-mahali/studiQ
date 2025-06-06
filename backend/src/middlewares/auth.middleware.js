import { catchAsyncError } from "./catchAsyncError.middleware.js";
import ErrorHandler from "./error.middleware.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = catchAsyncError(async (req, _, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  

  next();
});

export const isVerified = catchAsyncError(async (req, _, next) => {
  if (!req.user.accountVerified) {
    return next(new ErrorHandler("User is not verified.", 400));
  }
  next();
});
