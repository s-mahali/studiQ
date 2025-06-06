import ErrorHandler from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import z from "zod";
import { request } from "http";

const userData = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { username, email, password } = userData.parse(req.body);

    if (await User.findOne({ username })) {
      return next(new ErrorHandler("Username already exists", 400));
    }
    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
      ],
    });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    const verificationCode = await newUser.generateVerificationCode();
    try {
      // Send verification email
      await sendVerificationCode(verificationCode, email, res);
      await newUser.save();
    } catch (error) {
      return next(
        new ErrorHandler(
          `Failed to send verification email: ${error.message}`,
          500
        )
      );
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

async function sendVerificationCode(verificationCode, email, res) {
  try {
    const message = generateEmailTemplate(verificationCode);
    sendEmail({
      email,
      subject: `Verification Code for ${email}`,
      text: message,
    });
    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully to your email",
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send verification code" });
  }
}

function generateEmailTemplate(verificationCode) {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>`;
}

export const verifyEmail = catchAsyncError(async (req, res, next) => {
  const { verificationCode } = req.body;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    return next(new ErrorHandler("Invalid verification code", 400));
  }

  if (Date.now() > user.verificationCodeExpires) {
    return next(new ErrorHandler("Verification code has expired", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const resendVerificationCode = catchAsyncError(async(req, res, next) => {}); // need to implement resend verification code

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }
  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const token = user.generateToken();

  res.cookie("token", token, {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });

  const savedUser = user.toObject();
  delete savedUser.password;

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: savedUser,
  });
});

export const logout = catchAsyncError(async (req, res, next) => {
  res.clearCookie("token", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
    accountVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `//frontned url`;
  const message = `Your Reset Password Token is:- \n\n ${resetToken} \n\n If you have not requested this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "Reset password",
      message,
    });
    res.status(200).json({
      success: true,
      message: ` Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message ? error.message : "cannot send reset password token",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = request.body;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password token is invalid or has been expired",
        400
      )
    );
  }

  if (password != confirmPassword) {
    return next(
      new ErrorHandler("password and confirm password do not match ", 400)
    );
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res
    .status(200)
    .json({ message: "password reset successfully", success: true });
});
