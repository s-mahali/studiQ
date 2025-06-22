import { imageKit } from "../config/imagekit.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const createGroup = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { title, description } = req.body;
  const coverImage = req.file;
  console.log("userID", userId);

  if (!title || !description || !coverImage) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  //file upload
  let uploadResponse = null;
  if (coverImage) {
    try {
      const filestr = coverImage.buffer.toString("base64");
      uploadResponse = await imageKit.upload({
        file: filestr,
        fileName: `${userId}-group-${Date.now()}`,
        folder: "/StudiQgroupCoverImage",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

  const newGroup = await Group.create({
    title,
    description,
    coverImage: {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    },
    createdBy: userId,
    members: [
      {
        userId: user._id,
        role: "owner",
      },
    ],
  });

  // need to rollback and delete image from imagekit if something goes wrong

  //update user
  await User.findByIdAndUpdate(
    userId,
    {
      $push: { groups: { groupId: newGroup._id } },
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Group created successfully",
  });
});

export const editGroup = async (req, res, next) => {
  const userId = req.user._id;
  const { groupId } = req.params;

  const existingGroup = await Group.findById(groupId);
  if (!existingGroup) {
    return next(new ErrorHandler("Group Doesn't Exist", 404));
  }

  const { title, description } = req.body;
  const coverImage = req.file;

  if (!title && !description && !coverImage) {
    return next(new ErrorHandler("Atleast one field need to be updated", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  if (existingGroup.createdBy.toString() !== userId.toString()) {
    return next(new ErrorHandler("Permission Denied!", 403));
  }
  let updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  let fileId = null;
  if (existingGroup.coverImage) {
    fileId = existingGroup.coverImage.fileId;
  }
  //file upload
  if (coverImage) {
    try {
      const filestr = coverImage.buffer.toString("base64");
      const uploadResponse = await imageKit.upload({
        file: filestr,
        fileName: `${userId}-group-${Date.now()}`,
        folder: "/StudiQgroupCoverImage",
      });

      updateData.coverImage = {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
      };

      if (existingGroup.coverImage) {
        await imageKit.deleteFile(existingGroup.coverImage.fileId);
        console.log("old file deleted successfully", fileId);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } else {
    if (existingGroup.coverImage) {
      updateData.coverImage = existingGroup.coverImage;
    }
  }

  await Group.findByIdAndUpdate(groupId, updateData, { new: true });

  return res.status(200).json({
    success: true,
    message: "Group Updated Successfully",
  });
};

export const deleteGroup = async (req, res, next) => {
  const userId = req.user._id;
  const { groupId } = req.body;
  const existingGroup = await Group.findById(groupId);
  if (!existingGroup) {
    return next(new ErrorHandler("Group Doesn't Exist", 404));
  }
  if (existingGroup.createdBy.toString() !== userId.toString()) {
    return next(new ErrorHandler("Permission Denied!", 403));
  }

  if (existingGroup.coverImage) {
    await imageKit.deleteFile(existingGroup.coverImage.fileId);
  }

  //delete all group chat
  await Message.findByIdAndDelete({
    _id: {
      $in: existingGroup.channels.messages,
    },
  });

  await User.updateMany({
    groupId,

    $pull: {
      groups: groupId,
    },
  });

  await Group.findByIdAndDelete(groupId);
  return res.status(200).json({
    success: true,
    message: "Group Deleted Successfully",
  });
};

export const getGroupById = async (req, res, next) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId).populate({
    path: "members",
    select: "username profilePicture",
  });
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }
  return res.status(200).json({
    success: true,
    message: "Group fetched successfully",
    payload: group,
  });
};

export const getGroups = async (req, res, next) => {
  const groups = await Group.find().populate({
    path: "members",
    select: "username profilePicture",
  });
  return res.status(200).json({
    success: true,
    message: "Groups fetched successfully",
    payload: groups.length > 0 ? groups : [],
  });
};

export const getUserJoinedGroups = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  // not clear which group It will return
  const groups = await Group.find({
    members: groups.members.filter(
      (member) => member.userId.toString() !== userId.toString()
    ),
  });
  return res.status(200).json({
    success: true,
    message: "Groups fetched successfully",
    payload: groups.length > 0 ? groups : [],
  });
};

export const addMemberToGroup = async (req, res, next) => {
  const { joinKarnewalaKaID, groupId } = req.body;
  if (!joinKarnewalaKaID) {
    return next(new ErrorHandler("User required", 401));
  }
  const joinKarneWalaCandidate = await User.findById(joinKarnewalaKaID);
  const group = await Group.findById(groupId);
  const groupOwnerId = group.createdBy.toString();
  if (!group) {
    return next(new ErrorHandler("Group not Found", 404));
  }

  const isFriend = joinKarneWalaCandidate.friends.some(
    (user) => user.toString() === groupOwnerId
  );

  if (!isFriend) {
    return next(new ErrorHandler("Please Make Connection First", 403));
  }

  const isAlreadyMember = group.members.some(
    (member) => member.userId.toString() === joinKarnewalaKaID
  );

  if (isAlreadyMember) {
    return next(new ErrorHandler("User already a member", 400));
  }

  group.members.push({ userId: joinKarnewalaKaID });
  //TODO: send notification to user that he has been added to group
  await group.save();
  return res.status(200).json({
    success: true,
    message: "User Added to Group Successfully",
  });
};

// kick member from group
//leave group
