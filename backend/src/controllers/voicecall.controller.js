import Group from "../models/group.model.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { io } from "../socket/socket.js";

//successhandler
//return res.success(payload:object, message:string);

//start a voice call in group
export const startGroupCall = catchAsyncError(async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("group not found", 400));
  }

  //check if user is a member of the group
  const isMember = group.members.some(
    (member) => member.userId.toString() === userId.toString()
  );
  if (!isMember) {
    return next(new ErrorHandler("Access Denied", 403));
  }

  //update groupCall status
  group.activeCall = true;

  // Add user as a first participant
  group.callParticipants.push({
    userId,
    audio: true,
    video: false,
  });

  await group.save();
  // Emit socket event to notify group members
  const roomId = `group-${groupId}`;
  io.to(roomId).emit("voiceCall:started", {
    groupId,
    initiator: userId,
  });

  return res.success(group.callParticipants, "Voice call started successfully");
});

//Join an ongoing voice call
export const joinGroupCall = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { groupId } = req.params;
  const { peerId } = req.body; //peerjs id

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("group not found", 400));
  }

  //check if user is member of group ?
  const isMember = group.members.some(
    (member) => member.userId.toString() === userId.toString()
  );
  if (!isMember) {
    return next(new ErrorHandler("Access Denied", 403));
  }

  // check if call is active
  if (!group.activeCall) {
    return next(new ErrorHandler("Sorry, No active call for now", 400));
  }
  //check if user is already in call
  const isAlreadyInCall = group.callParticipants.some(
    (participant) => participant.userId.toString() === userId.toString()
  );
  if (!isAlreadyInCall) {
    // Add user to participant
    group.callParticipants.push({
      userId,
      audio: true,
    });
    await group.save();
  } else {
    // update existing participant's joined time , I am confused here lil bit should i update the joinedTime or leave it as it is.
    const participantIndex = group.callParticipants.findIndex(
      (pc) => pc.userId.toString() === userId.toString()
    );
    if (participantIndex !== -1) {
      group.callParticipants[participantIndex].joinedAt = new Date();
      await group.save();
    }
  }
  //TODO:  I have one doubt can't i populate to group which i have find above
  // Get populated participants for response
  const populatedGroup = await Group.findById(groupId).populate({
    path: "callParticipants.userId",
    select: "username profilePicture",
  });

  // Emit socket event to notify other participants
  const roomId = `group-${groupId}`;
  io.to(roomId).emit("voiceCall:userJoined", {
    groupId,
    userId,
    peerId,
    joinedAt: new Date(),
  });

  return res.success(
    populatedGroup.callParticipants,
    "Joined voice call successfully"
  );
});

//Leave a voice call
export const leaveGroupCall = catchAsyncError(async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const group = await Group.findByIdAndUpdate(
    groupId,
    { $pull: { callParticipants: { userId: userId } } },
    
  );
  if (!group) {
    return next(new ErrorHandler("group not found", 400));
  }

  //Remove user from participants
  //TODO, not conform if this mongo query is correct
  console.log("group", group);

  //If no participant left end the vc
  if (group.callParticipants.length === 0) {
    group.activeCall = false;
  }
  await group.save();

  //emit socket event
  const roomId = `group-${groupId}`;
  io.to(roomId).emit("voiceCall:userLeft", {
    groupId,
    userId,
  });

  return res.success(null, "Left voice call successfully");
});

//Toggle Audio/video status
export const toggleMedia = catchAsyncError(async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user._id;
  const { audio, video } = req.body;
  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("group not found", 400));
  }

  //Find participant and update media status
  const participantIndex = group.callParticipants.findIndex(
    (pc) => pc.userId.toString() === userId.toString()
  );

  if (participantIndex === -1) {
    return next(new ErrorHandler("you are not in this call", 400));
  }

  //update media status if provided
  if (audio !== undefined) {
    group.callParticipants[participantIndex].audio = audio;
  }

  if (video !== undefined) {
    group.callParticipants[participantIndex].video = video;
  }

  await group.save();

  //Emit socket event
  const roomId = `group-${groupId}`;
  io.to(roomId).emit("voiceCall: mediaToggled", {
    groupId,
    userId,
    audio: group.callParticipants[participantIndex].audio,
    video: group.callParticipants[participantIndex].video,
  });

  return res.success(
    {
      audio: group.callParticipants[participantIndex].audio,
      video: group.callParticipants[participantIndex].video,
    },
    "Media toggled successfully"
  );
});

//Get current call participants
export const getCallParticipants = catchAsyncError(async (req, res, next) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId).populate({
    path: "callParticipants.userId",
    select: "username profilePicture",
  });
  if (!group) {
    return next(new ErrorHandler("group not found", 400));
  }
  return res.success(
    {
      participants: group.callParticipants,
      isActive: group.activeCall,
    },
    "Participants fetched successfully"
  );
});

//End call, for now skipping end call functionality, If there will be 0 participants call will end automatically
