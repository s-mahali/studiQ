//user will send request to peers
//peers will accept or reject the request
//
import User from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";

export const suggestPeers = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  try {
    const getPeerlist = await User.find({
      _id: { $ne: userId },
      accountVerified: true,
      $or: [
        {
          subjects: {
            $elemMatch: {
              name: { $in: user.subjects.map((subject) => subject.name) },
            },
          },
        },
        {
          skills: {
            $elemMatch: {
              name: { $in: user.skills.map((skill) => skill.name) },
            },
          },
        },
        { educationLevel: user.educationLevel },
        {
          goals: {
            $elemMatch: {
              description: { $in: user.goals.map((goal) => goal.description) },
            },
          },
        },
      ],
      limit: 10,
    });

    if (getPeerlist.length > 0) {
      res.status(200).json({
        success: true,
        peerlist: getPeerlist,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "No peers found",
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
    .select("username subject profilePicture skills educationLevel goals")
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
  if (senderId.toString() === receiverId.toString()) {
    return next(new ErrorHandler("Cannot send request to yourself", 400));
  }
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new ErrorHandler("User not found", 404));
  }

  //check if already request sent or exist
  const existingRequest = receiver.friendRequests.find(
    (req) =>
      (req.from.toString() === senderId.toString() &&
        req.status === "pending") ||
      req.status === "accepted" ||
      req.status === "rejected"
  );

  //check if already friends
  const alreadyFriend = receiver.friends.find(
    (req) => req.user.toString() === senderId.toString()
  );

  if (existingRequest || alreadyFriend) {
    return next(
      new ErrorHandler("Friend request already sent or already friends", 400)
    );
  }

  const updateReceiver = await User.findByIdAndUpdate(
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
  )
    .select("username profilePicture friendRequests")
    .populate("friendRequests.from", "username profilePicture");

  //TODO: realtime notification socket.io implementation for notification and sound system also

  const updateSender = await User.findByIdAndUpdate(
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
  )
    .select("username profilePicture sentFriendRequests")
    .populate("sentFriendRequests.to", "username profilePicture");

  return res.status(200).json({
    receiver: updateReceiver,
    sender: updateSender,
    message: " Friend Request sent ",
  });
});

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
