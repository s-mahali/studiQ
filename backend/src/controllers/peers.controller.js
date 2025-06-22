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

  try {
    //Get IDs of users which need to exclude from suggestion
    const friendIds = user.friends.map((friend) => friend.user.toString());
    const receivedRequestIds = user.friendRequests.map((req) =>
      req.from.toString()
    );
    const sentRequestIds = user.sentFriendRequests.map((req) =>
      req.to.toString()
    );

    const excludeIds = [
      userId.toString(),
      ...friendIds,
      ...receivedRequestIds,
      ...sentRequestIds,
    ];

    let getPeerlist = await User.find({
      _id: { $nin: excludeIds },
      ccountVerified: true,

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

    if (getPeerlist.length < 3) {
      console.log("Not enough matching peers, fetching any available users");
      getPeerlist = await User.find({
        _id: { $nin: excludeIds },
        accountVerified: true,
      })
        .select("profilePicture username skills subjects nickname")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    }

    //pendingRequestsIds
    const pendingRequestIds = user.sentFriendRequests
      .filter((req) => req.status === "pending")
      .map((req) => req.to.toString());
    return res.status(200).json({
      success: true,
      peerlist: getPeerlist.length > 0 ? getPeerlist : [],
      message: "Peerlist fetched successfully",
      pendingRequests: pendingRequestIds,
      page,
      total: getPeerlist.length,
    });
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
    peers: peers.length > 0 ? peers : [],
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
    .limit(5)
    .sort({ createdAt: 1 })
    .populate("sentFriendRequests.to", "username profilePicture");

  const formattedRequests = requests.sentFriendRequests.map((request) => ({
    requestId: request._id.toString(),
    reciever: {
      id: request.to._id,
      username: request.to.username,
      profilePicture: request.to.profilePicture,
      status: request.status,
    },
  }));
  if (formattedRequests.length >= 0) {
    return res.status(200).json({
      success: true,
      payload: formattedRequests || [],
      message: "Friend requests fetched successfully",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "No friend requests found",
    });
  }
});

export const cancelSentFriendRequest = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user._id;
    const { sentUserId } = req.body;

    //validate both users exist
    const [user, sentUser] = await Promise.all([
      User.findById(userId),
      User.findById(sentUserId),
    ]);

    if (!user || !sentUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isRequestSent = user.sentFriendRequests.some(
      (request) =>
        request.to.toString() === sentUserId && request.status === "pending"
    );

    if (!isRequestSent) {
      return next(new ErrorHandler("Friend request not found", 404));
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          sentFriendRequests: {
            to: sentUserId,
          },
        },
      },
      { new: true }
    );

    const updateUser2 = await User.findByIdAndUpdate(
      sentUserId,
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
      payload: null,
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
    (req) => req.from.toString() === reqSenderId && req.status === "pending"
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

export const getIncomingFriendRequest = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("unauthorized", 401));
    }

    const userData = await User.findById(userId)
      .select("friendRequests")
      .populate("friendRequests.from", "username profilePicture nickname");

    const formattedRequests = userData.friendRequests.map((request) => ({
      requestId: request._id,
      sender: {
        id: request.from._id,
        username: request.from.username,
        profilePicture: request.from.profilePicture,
        nickname: request.from.nickname,
      },
      status: request.status,
      createdAt: request.createdAt,
    }));

    if (formattedRequests.length > 0) {
      return res.status(200).json({
        success: true,
        requests: formattedRequests,
        count: formattedRequests.length,
        message: "Friend requests fetched successfully",
      });
    } else {
      return res.status(200).json({
        success: true,
        requests: [],
        count: 0,
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
    (req) => req.from.toString() === reqSenderId && req.status === "pending"
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
