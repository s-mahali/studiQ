//user will send request to peers
//peers will accept or reject the request
//
import User from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";

export const suggestPeers = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //Get IDs of users which need to exclude from suggestion


  try {
    let getPeerlist = await User.find({
      _id: { $ne: userId },
      freinds: {
        user: {
          $ne: userId,
        },
      },
      friendRequests: {
        from: {
          $ne: userId,
        },
      },
      sentFriendRequests: {
        to: {
          $ne: userId,
        },
      },
      accountVerified: true,

      $or: [
        {
          //match any subject name
          "subjects.name": {
            $in: user.subjects.map((subject) => subject.name),
          },
        },
        {
          //match any skill name
          "skills.name": { $in: user.skills.map((skill) => skill.name) },
        },
        { educationLevel: user.educationLevel },
      ],
    })
      .select(
        "profilePicture username skills subjects  nickname friendRequests"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    console.log("peerlist", getPeerlist);

    if (getPeerlist.length > 2) {
      res.status(200).json({
        success: true,
        peerlist: getPeerlist,
        message: "Peerlist fetcheding successfully",
        pendingRequests: getPeerlist.map((peer) => peer.friendRequests),
        page,
        total: getPeerlist.length,
      });
    } else {
      getPeerlist = await User.find({
        _id: { $ne: userId },
        freinds: {
          user: {
            $ne: userId,
          },
        },
        freindRequests: {
          from: {
            $ne: userId,
          },
        },
        sentFriendRequests: {
          to: {
            $ne: userId,
          },
        },
        accountVerified: true,
      })
        .select(
          "profilePicture username skills subjects  nickname friendRequests"
        )
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      console.log("peerlist", getPeerlist);
      return res.status(200).json({
        success: true,
        peerlist: getPeerlist,
        pendingRequests: getPeerlist.map((peer) => peer.friendRequests),
        message: "Peerlist fetched successfully",
        page,
      });
    }
  } catch (error) {
    console.log(error.message);
    return next(new ErrorHandler("something went wrong", 500));
  }
});

export const getAllPeers = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("unauthorized", 401));
  }

  const peers = await User.find({
    _id: { $ne: userId },
    accountVerified: true,
  })
    .select("username subject profilePicture skills educationLevel ")
    .limit(10);

  res.status(200).json({
    success: true,
    peers,
  });
});

export const sendFriendRequest = catchAsyncError(async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  //prevent sending to self
  if (senderId.toString() === receiverId) {
    return next(new ErrorHandler("Cannot send request to yourself", 400));
  }
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    return next(new ErrorHandler("User not found", 404));
  }

  //check if already request sent or exist
  const existingRequest = receiver.friendRequests.find(
    (req) =>
      req.from.toString() === senderId.toString() &&
      ["pending", "accepted", "rejected"].includes(req.status)
  );

  //check if already friends
  const alreadyFriend = receiver.friends.find((req) => req.user == senderId);
  console.log("alreadyFriend", alreadyFriend);

  if (existingRequest || alreadyFriend) {
    return next(
      new ErrorHandler("Friend request already sent or already friends", 400)
    );
  }

  await User.findByIdAndUpdate(
    receiverId,
    {
      $addToSet: {
        friendRequests: {
          from: senderId,
          to: receiverId,
          status: "pending",
        },
      },
    },
    { new: true }
  );

  //TODO: realtime notification socket.io implementation for notification and sound system also

  await User.findByIdAndUpdate(
    senderId,
    {
      $addToSet: {
        sentFriendRequests: {
          to: receiverId,
          status: "pending",
        },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    message: " Friend Request sent ",
    success: true,
    payload: null,
  });
});

export const getSendFriendRequest = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("unauthorized", 401));
  }
  const requests = await User.findById(userId)
    .select("sentFriendRequests")
    .populate("sentFriendRequests.to", "username profilePicture");

  if (requests.length > 0) {
    return res.status(200).json({
      success: true,
      payload: requests,
      message: "Friend requests fetched successfully",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "No friend requests found",
    });
  }
});

export const deleteSendFriendRequest = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user._id;
    const { reqSenderId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("unauthorized", 401));
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          sentFriendRequests: {
            to: reqSenderId,
          },
        },
      },
      { new: true }
    );

    const updateUser2 = await User.findByIdAndUpdate(
      reqSenderId,
      {
        $pull: {
          friendRequests: {
            from: userId,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Friend request deleted successfully",
      data: null,
    });
  }
);

export const acceptFriendRequest = catchAsyncError(async (req, res, next) => {
  const acceptKarneWalaKaId = req.user._id;
  const { reqSenderId } = req.body;

  //validate both users exist
  const [accepter, sender] = await Promise.all([
    User.findById(acceptKarneWalaKaId),
    User.findById(reqSenderId),
  ]);

  if (!accepter || !sender) {
    return next(new ErrorHandler("User not found", 404));
  }

  //find the specific friendRequst
  const reqIndex = accepter.friendRequests.findIndex(
    (req) =>
      req.from.toString() === reqSenderId.toString() && req.status === "pending"
  );

  if (reqIndex === -1) {
    return next(new ErrorHandler("Friend Request not found", 404));
  }

  try {
    //1. update the accepter //add to friendlist
    //remove from friendRequests
    //update request status to "accepted"
    const [updatedAccepter, updatedSender] = await Promise.all([
      User.findByIdAndUpdate(
        acceptKarneWalaKaId,
        {
          $push: { friends: { user: reqSenderId, status: "active" } },
          $pull: { friendRequests: { from: reqSenderId } },
        },
        {
          new: true,
        }
      ),

      //2. update the sender:
      // add to friend list
      // remove from sentFriendRequst
      User.findByIdAndUpdate(
        reqSenderId,
        {
          $push: { friends: { user: acceptKarneWalaKaId } },
          $pull: { sentFriendRequests: { to: acceptKarneWalaKaId } },
        },
        {
          new: true,
        }
      ),
    ]);
    if (!updatedAccepter || !updatedSender) {
      throw new Error("Failed to update user records");
    }

    //TODO: notification to sender
    return res
      .status(200)
      .json({ success: true, message: "you are now friends!" });
  } catch (error) {
    return next(new ErrorHandler("Failed to accept friend request", 500));
  }
});

export const getAcceptFriendRequest = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("unauthorized", 401));
    }
    const requests = await User.findById(userId)
      .select("friendRequests")
      .populate("friendRequests.from", "username profilePicture");

    if (requests.length > 0) {
      return res.status(200).json({
        success: true,
        requests,
        message: "Friend requests fetched successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No friend requests found",
      });
    }
  }
);

export const rejectFriendRequest = catchAsyncError(async (req, res, next) => {
  const rejectKarneWalaKaId = req.user._id;
  const { reqSenderId } = req.body;

  //validate both users exist
  const [rejecter, sender] = await Promise.all([
    User.findById(rejectKarneWalaKaId),
    User.findById(reqSenderId),
  ]);

  if (!rejecter || !sender) {
    return next(new ErrorHandler("User not found", 404));
  }

  //find the specific friendRequst
  const reqIndex = rejecter.friendRequests.findIndex(
    (req) =>
      req.from.toString() === reqSenderId.toString() && req.status === "pending"
  );

  if (reqIndex === -1) {
    return next(new ErrorHandler("Friend Request not found", 404));
  }

  try {
    //1. update the rejecter
    //remove from friendRequests

    const [updatedRejecter, updatedSender] = await Promise.all([
      User.findByIdAndUpdate(
        rejectKarneWalaKaId,
        {
          $pull: { friendRequests: { from: reqSenderId } },
        },
        {
          new: true,
        }
      ),

      //2. update the sender:

      // remove from sentFriendRequst
      User.findByIdAndUpdate(
        reqSenderId,
        {
          $pull: { sentFriendRequests: { to: rejectKarneWalaKaId } },
        },
        {
          new: true,
        }
      ),
    ]);
    if (!updatedRejecter || !updatedSender) {
      throw new Error("Failed to update user records");
    }

    //TODO: notification to sender
    return res.status(200).json({
      success: true,
      message: "sorry! your request have been Rejected.",
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to reject friend request", 500));
  }
});
