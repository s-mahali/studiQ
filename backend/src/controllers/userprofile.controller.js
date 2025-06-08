import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import {
  updateUserService,
  uploadProfilePictureService,
} from "../service/user.service.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { z } from "zod";
import multer from "multer";
import User from "../models/user.model.js";

//configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 mb limit
  },
  fileFilter: (req, file, cb) => {
    //accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("only image files are allowed"), false);
    }
  },
});

//schema validation
const updateUserSchema = z.object({
  subjects: z
    .array(
      z.object({
        name: z.string(),
        proficiency: z
          .enum(["beginner", "intermediate", "advanced"])
          .default("beginner"),
      })
    )
    .optional(),
  nickname: z
    .string()
    .min(3, "Nickname must be at least 3 characters long")
    .trim()
    .optional(),
  educationLevel: z
    .enum(["high school", "college", "graduate", "professional", "other"])
    .default("other")
    .optional(),
  skills: z
    .array(
      z.object({
        name: z
          .string()
          .min(3, "Skill name must be at least 3 characters long")
          .trim(),
      })
    )
    .optional(),
});

export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  try {
    //parse and validate request body
    const validatedData = updateUserSchema.parse(req.body);
    //Handle JSON string data (because using formData)
    if (typeof req.body.subjects === "string") {
      validatedData.subjects = JSON.parse(req.body.subjects);
    }
    if (typeof req.body.skills === "string") {
      validatedData.skills = JSON.parse(req.body.skills);
    }

    const userId = req.user._id;
    console.log("userId", userId);
    //call service here
    const updatedUser = await updateUserService(userId, validatedData);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ErrorHandler(error.errors[0].message, 400));
    }
    return next(error);
  }
});

export const uploadProfilePic = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const file = req.file;
  if (!file) {
    return next(new ErrorHandler("Please upload a file", 400));
  }
  // call uploadProfilePictureService   here
  const updatedUser = await uploadProfilePictureService(userId, file);
  if (!updatedUser) {
    return next(new ErrorHandler("Failed to update profile picture", 500));
  }

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    payload: null,
  });
});

//get-user-profile
export const getUserProfileById = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }
  console.log("user", user);

  return res.status(200).json({
    success: true,
    message: "User fetched successfully!",
    payload: user,
  });
});
