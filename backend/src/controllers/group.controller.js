import ErrorHandler from "../middlewares/error.middleware.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res, next) => {
  const userId = req.user._id;
  const { title, description } = req.body;
  const { coverImage } = req.file;

  if (!title || !description || !coverImage) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  //file upload
  if (coverImage) {
    try {
      const filestr = coverImage.buffer.toString("base64");
      await imageKit.upload({
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
    createdBy: userId,
  });

  //update user
  await User.findByIdAndUpdate(
    userId,
    {
      $push: { groups: { groupId: newGroup._id, role: "owner" } },
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Group created successfully",
  });
};

export const editGroup = async (req, res, next) => {
  const userId = req.user._id;
  const { title, description, groupId } = req.body;
  const { coverImage } = req.file;

  if (!title || !description || !coverImage) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const existingGroup = await Group.findById(groupId);
  if (!existingGroup) {
    return next(new ErrorHandler("Group Doesn't Exist", 404));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  if (existingGroup.createdBy.toString() !== userId.toString()) {
    return next(new ErrorHandler("Permission Denied!", 403));
  }
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

      await Group.findByIdAndUpdate(groupId, {
        title: title ? title : existingGroup.title,
        description: description ? description : existingGroup.description,
        coverImage: coverImage
          ? {
              url: uploadResponse.url,
              fileId: uploadResponse.fileId,
            }
          : {
              url: existingGroup.coverImage.url,
              fileId: existingGroup.coverImage.fileId,
            },
      });

      if (fileId) {
        await imageKit.deleteFile(fileId);
        console.log("old file deleted successfully", fileId);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

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

  //let groupChat = []; need to delete all group chat messages
  //delete group from users
  await User.updateMany(
    { groups: { $elemMatch: { groupId: groupId } } },
    { $pull: { groups: { groupId: groupId } } }
  );

  await Group.findByIdAndDelete(groupId);
  return res.status(200).json({
    success: true,
    message: "Group Deleted Successfully",
  });
};

export const  getGroupById = async (req, res, next) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate({path: "members", select: "username profilePicture"});
    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }
    return res.status(200).json({
      success: true,
      message: "Group fetched successfully",
      payload: group,
    });
}

export const getGroups = async (req, res, next) => {
  const groups = await Group.find().populate({path: "members", select: "username profilePicture"});
  return res.status(200).json({
    success: true,
    message: "Groups fetched successfully",
    payload: groups.length > 0 ? groups : [],
  });
}

export const getUserJoinedGroups = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const groups = await Group.find({
     members: groups.members.filter((member) => member._id.toString() !== userId.toString()),
  })
  return res.status(200).json({
    success: true,
    message: "Groups fetched successfully",
    payload: groups.length > 0 ? groups : [],
  });
}
