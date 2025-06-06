import User from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { imageKit } from "../config/imagekit.js";

export const updateUserService = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const updateFields = {};

  //only add fields that are provided in the updateData
  if (updateData.subjects) {
    updateFields.subjects = updateData.subjects;
  }
  if (updateData.nickname) {
    updateFields.nickname = updateData.nickname;
  }
  if (updateData.educationLevel) {
    updateFields.educationLevel = updateData.educationLevel;
  }
  if (updateData.skills) {
    updateFields.skills = updateData.skills;
  }

  //only update if there are fields to update
  if (Object.keys(updateFields).length === 0) {
    throw new ErrorHandler("No fields to update", 400);
  }
  //TODO: need to write separate service for profile picture and profile details so skills and subjects can be updated separately
  //update user and return updated document
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateFields,
    },

    {
      new: true,
      runValidators: true,
    }
  );
  return updatedUser;
};

//handle profilePicture upload
export const uploadProfilePictureService = async (userId, profilePicture) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }
  //check if user already has a profile picture
  let fileId = null;
  if (user.profilePicture) {
    fileId = user.profilePicture.fileId;
    console.log("fileId", fileId);
  }
  //upload new profile picture to imagekit
  if (profilePicture) {
    try {
      //convert buffer to base64
      const filestr = profilePicture.buffer.toString("base64");
      //upload to imageKit
      const uploadResponse = await imageKit.upload({
        file: filestr,
        fileName: `${userId}-profile-${Date.now()}`,
        folder: "/StudiQuserProfile",
      });
      //update user profile picture in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            profilePicture: {
              url: uploadResponse.url,
              fileId: uploadResponse.fileId,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      //If update succesful and there was an old profilePic, delete it
      if (fileId) {
        try {
          await imageKit.deleteFile(fileId);
        } catch (err) {
          console.error("failed to delete old pfp", err);
        }
      }

      return updatedUser;
    } catch (error) {
      throw new ErrorHandler(
        `Failed to upload profile picture: ${error.message}`,
        500
      );
    }
  }
  return user;
};
