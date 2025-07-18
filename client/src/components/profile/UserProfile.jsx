import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  User,
  Settings,
  Calendar,
  Clock,
  Award,
  ChevronDown,
  BookOpen,
  Layers,
  Users,
  UserPlus,
  Send,
  Check,
  BarChart3,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import {
  acceptFriendRequest,
  cancelSentRequest,
  editProfilePic,
  fetchSendRequests,
  fetchUserProfile,
  getIncomingFriendRequests,
  rejectFriendRequest,
  sendConnectionToPeers,
  userLogout,
} from "@/services/api.services";
import { setAuthUser} from "@/redux/slicers/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { removeMessage } from "@/redux/slicers/chatSlice";
import { formatTime } from "@/lib/formatTime";

export default function StudyProfilePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState([]);
  const [sendRequest, setSendRequest] = useState([]);
  const [editPfpOpen, setEditPfpOpen] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [pfpUrl, setPfpUrl] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("none"); //none, friend, incoming, outgoing
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const pfpRef = useRef();
  const [pfpLoading, setPfpLoading] = useState(false);
  const { userId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authorId = useSelector((state) => state.auth.user?._id);
  const isAuthor = authorId === userId;
  const {userGroups} = useSelector((store) => store.group);
  const {groupMembers} = useSelector((store) => store.group);
  console.log(groupMembers);
  const {user} = useSelector((store) => store.auth);

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPfpUrl(file);
    }
  };

  useEffect(() => {
    setProfileLoading(true);
    async function fetchProfileData() {
      try {
        if (!userId) {
          
          setProfileLoading(false);
          return;
        }
        const response = await fetchUserProfile(userId);
        if (response?.status === 200) {
          setProfileData(response?.data.payload);
          
          if (userId === authorId) {
            dispatch(setAuthUser(response.data.payload));
          }
        }
      } catch (error) {
        toast.error(error.response.data.message);
        navigate("/");
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfileData();
  }, [userId, dispatch, navigate, authorId]);

  const updatePfp = async () => {
    if (!pfpUrl) return;
    setPfpLoading(true);
    try {
      const response = await editProfilePic(pfpUrl);
      if (response.status === 200) {
        toast.success(response.data.message);
        setEditPfpOpen(false);
        setPfpUrl("");
      }
    } catch (error) {
      toast.error(error?.response.data.message || "something went wrong");
    } finally {
      setPfpLoading(false);
    }
  };

  //logout
  const handleLogOut = async () => {
    try {
      const response = await userLogout();
      if (response.status === 200) {
        navigate("/");
        dispatch(setAuthUser(null));
        dispatch(removeMessage([]));
      }
    } catch (error) {
      toast.error(error.response.data.message || "something went wrong!");
    }
  };

  const incomingRequestHandler = async () => {
    try {
      const response = await getIncomingFriendRequests();
      if (response.status === 200) {
        setIncomingRequest(response.data.requests);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || "something went wrong");
    }
  };

  const handleSendRequest = async (receiverId) => {
    setConnectionLoading(true);
    try {
      const response = await sendConnectionToPeers({ receiverId });
      if (response?.status === 200) {
        setRelationshipStatus("outgoing");
        toast.success(response.data.message || "Request Sent Successfully");
        await sentRequestHandler();
      }
    } catch (error) {
      console.error(error.message);
      toast.error(
        error.response.data.message || "error sending connection request"
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  const sentRequestHandler = async () => {
    try {
      const response = await fetchSendRequests();
      if (response.status === 200) {
        setSendRequest(response.data.payload);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(
        error.response.data.message || "failed to fetch sent requests"
      );
    }
  };
  //cancel sent-request
  const handleCancelRequest = async (receiverId) => {
    setCancelLoading(true);

    try {
      const response = await cancelSentRequest({
        sentUserId: receiverId,
      });
      if (response.status === 200) {
        await sentRequestHandler();
        setRelationshipStatus("none");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || "failed to cancel request");
    } finally {
      setCancelLoading(false);
    }
  };

  //accept request
  const handleAcceptRequest = async (senderId) => {
    setMessageLoading(true);
    try {
      const response = await acceptFriendRequest({
        reqSenderId: senderId,
      });
      if (response.status === 200) {
        toast.success(response.data.message);

        await incomingRequestHandler();
        await sentRequestHandler();
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || "failed to accept request");
    } finally {
      setMessageLoading(false);
    }
  };

  //reject friend request
  const handleRejectRequest = async (senderId) => {
    setActionLoading(true);
    try {
      const response = await rejectFriendRequest({
        reqSenderId: senderId,
      });
      if (response?.status === 200) {
        await incomingRequestHandler();
        setRelationshipStatus("none");
        toast.success(response?.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data.message || "failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthor && profileData && incomingRequest && sendRequest) {
      const isFriend =
        profileData.friends.length > 0 &&
        profileData.friends.some(
          (friend) =>
            friend.user._id.toString() == authorId.toString() ||
            (friend.user._id && friend.user._id == authorId)
        );

      if (isFriend) {
        setRelationshipStatus("friend");
        return;
      }
      const hasIncomingRequest = incomingRequest.some(
        (request) => request.sender.id == userId
      );
      if (hasIncomingRequest) {
        setRelationshipStatus("incoming");
        return;
      }
      const hasSentRequest = sendRequest.some(
        (req) => req.reciever.id === userId
      );

      if (hasSentRequest) {
        setRelationshipStatus("outgoing");
        return;
      }
      setRelationshipStatus("none");
    }
  }, [isAuthor, profileData, incomingRequest, sendRequest, userId, authorId]);

  useEffect(() => {
    incomingRequestHandler();
    sentRequestHandler();
  }, [isAuthor, profileData, incomingRequest, sendRequest, userId, authorId]);

  useEffect(() => {
      const isMember = groupMembers?.includes(user?._id);
      setIsMember(isMember);
  },[])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {profileLoading ? (
        <div className="flex min-h-screen justify-center items-center">
          <Loader2 className="animate-spin  w-16 h-16 text-teal-400" />
        </div>
      ) : (
        <div className="bg-gradient-to-b from-teal-900/30 to-transparent py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Left column: Profile info */}
                <div className="lg:w-9/12">
                  <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                    <div
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setAvatarHover(true)}
                      onMouseLeave={() => setAvatarHover(false)}
                    >
                      <img
                        src={profileData?.profilePicture.url}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-teal-500 aspect-square object-cover"
                      />
                      {profileData?.isActive && (
                        <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></span>
                      )}
                      {
                        // hover overlay
                        <AnimatePresence>
                          {avatarHover && isAuthor && (
                            <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: 0.1 }}
                              whileHover={{ scale: 1 }}
                              whileTap={{ scale: 0.7 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                              onClick={() => {
                                setEditPfpOpen(true);
                                setTimeout(() => pfpRef.current?.click(), 200);
                              }}
                              type="button"
                            >
                              <span className="flex flex-col items-center">
                                <Pencil className="w-6 h-6 text-white mb-1 " />
                              </span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      }
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">
                          {profileData?.nickname}
                        </h1>
                        {profileData?.accountVerified && (
                          <span className="bg-teal-500 p-1 rounded-full">
                            <Check size={16} className="text-gray-900" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-gray-400 mb-4">
                        <span>@{profileData?.username}</span>
                        <span className="mx-2">•</span>
                        <span>{profileData?.educationLevel}</span>
                      </div>

                      {isAuthor ? (
                        <Link to="/edit-profile">
                          <button className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer">
                            Edit Profile
                          </button>
                        </Link>
                      ) : (
                        <>
                          {relationshipStatus === "friend" && (
                            <button
                              disabled
                              className="bg-gray-600 px-4 py-2 rounded-md text-sm font-medium"
                            >
                              <Users size={16} className="inline mr-2" />
                              Friends
                            </button>
                          )}
                          {relationshipStatus === "incoming" && (
                            <button
                              onClick={() => handleAcceptRequest(userId)}
                              disabled={messageLoading}
                              className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer"
                            >
                              {messageLoading ? (
                                <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />
                              ) : (
                                <UserPlus size={16} className="inline mr-2" />
                              )}
                              Accept Request
                            </button>
                          )}

                          {relationshipStatus === "outgoing" && (
                            <button
                              disabled
                              className="bg-gray-600 px-4 py-2 rounded-md text-sm font-medium"
                            >
                              <Clock size={16} className="inline mr-2" />
                              Request Sent
                            </button>
                          )}

                          {relationshipStatus === "none" && (
                            <button
                              onClick={() => handleSendRequest(userId)}
                              disabled={connectionLoading}
                              className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer"
                            >
                              {connectionLoading ? (
                                <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />
                              ) : (
                                <UserPlus size={16} className="inline mr-2" />
                              )}
                              Connect
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* edit pfp picture dialog */}
                  {isAuthor && (
                    <Dialog open={editPfpOpen} onOpenChange={setEditPfpOpen}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DialogContent className={"max-w-xs"}>
                          <DialogHeader>
                            <DialogTitle>Edit Profile Picture</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <img
                              src={
                                pfpUrl
                                  ? URL.createObjectURL(pfpUrl)
                                  : profileData?.profilePicture?.url
                              }
                              alt="pfp"
                              className="w-24 h-24 rounded-full border-2 border-teal-500 object-cover"
                            />
                            <input
                              type="file"
                              ref={pfpRef}
                              className="hidden"
                              accept="image/*"
                              onChange={fileChangeHandler}
                            />
                            <button
                              type="button"
                              onClick={() => pfpRef.current?.click()}
                              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white text-xs font-medium"
                            >
                              Choose File
                            </button>

                            <button
                              onClick={updatePfp}
                              disabled={pfpLoading}
                              className="bg-teal-600 hover:bg--teal-700 px-4 py-2
                    rounded text-white text-sm font-medium cursor-pointer"
                            >
                              {pfpLoading ? (
                                <Loader2 className="animate-spin mr-4" />
                              ) : (
                                "Upload New Picture"
                              )}
                            </button>
                          </div>
                        </DialogContent>
                      </motion.div>
                    </Dialog>
                  )}

                  {/* Stats Grid */}

                  {/* Activity and Progress */}
                  <div className="bg-gray-800/60 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 size={20} />
                        Study Activity
                      </h2>
                      <div className="text-sm text-gray-400">
                        <span className="text-teal-400 font-medium">
                          Last login:
                        </span>{" "}
                        {profileData?.activity.lastLogin
                          ? new Date(
                              profileData?.activity.lastLogin
                            ).toLocaleString("en-Us", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : ""}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-teal-400 font-medium">
                            {/* {profileData?.activity.progress || 70}% */}
                            70%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full mb-6">
                          <div
                            className="h-2 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full"
                            style={{
                              width: `70%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <div className="text-gray-400">
                              Total Study Hours
                            </div>
                            <div className="text-lg font-semibold">
                              {/* {profileData?.activity.totalStudyTime} || 70 */}
                              150
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400">Weekly Goal</div>
                            <div className="text-lg font-semibold">
                              160 hours
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Placeholder for study activity chart */}
                        <div className="h-24 bg-gray-700/50 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">
                            Study Activity Graph
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjects and Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-800/60 rounded-lg p-6">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <BookOpen size={20} />
                        Subjects
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profileData?.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-teal-300 px-3 py-1 rounded-full text-sm"
                          >
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/60 rounded-lg p-6">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <Award size={20} />
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profileData?.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-teal-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Study Groups */}
                  <div className="bg-gray-800/60 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <Layers size={20} />
                      Study Groups
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userGroups && userGroups.map((group) => (
                        <div
                          key={group.id}
                          className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between"
                        >
                          <span>{group.title}</span>
                          {
                           isMember || isAuthor &&
                            <Link className="text-teal-400 hover:text-teal-300 transition-colors" to={`/study-zone/${group?._id}`}>
                            View
                          </Link>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column: Friends, requests, settings */}
                <div className="lg:w-3/12">
                  {isAuthor ? (
                    <>
                      <div className="relative mb-6">
                        <button
                          className="bg-gray-800/60 w-full p-4 rounded-lg flex items-center justify-between"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <div className="flex items-center gap-2">
                            <Settings size={18} />
                            <span>Account Settings</span>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              showDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showDropdown && (
                          <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-10 py-2">
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-700"
                            >
                              Profile Settings
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-700"
                            >
                              Privacy
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-700"
                            >
                              Notifications
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-700"
                            >
                              Study Preferences
                            </a>
                            <Button
                              onClick={handleLogOut}
                              variant={"outline"}
                              className="block px-4 py-2 hover:bg-gray-700 w-full cursor-pointer"
                            >
                              Logout
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                        {relationshipStatus === "friend" ? (
                          <div className="flex gap-2 flex-col">
                            <div className="w-full bg-gray-700 py-2 px-4 rounded-md text-center">
                              <Users size={16} className="inline mr-2" />
                              You and {profileData?.username} are friends
                            </div>
                            <Link to={`/dm/${userId}`}>
                              <button className="w-full bg-transparent border border-teal-500 hover:bg-teal-800/20 py-2 rounded-md text-teal-400 font-medium transition-colors">
                                <Send size={16} className="inline mr-2" />
                                Send Message
                              </button>
                            </Link>
                          </div>
                        ) : relationshipStatus === "incoming" ? (
                          <div className="flex gap-2 flex-col">
                            <button
                              onClick={() => handleAcceptRequest(userId)}
                              disabled={messageLoading}
                              className="w-full bg-teal-600 hover:bg-teal-700 py-2 rounded-md text-white font-medium transition-colors"
                            >
                              {messageLoading ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin inline mr-2"
                                />
                              ) : (
                                <UserPlus size={16} className="inline mr-2" />
                              )}
                              Accept Request
                            </button>
                            <button
                              className="w-full bg-transparent border border-red-500 hover:bg-red-800/20 py-2 rounded-md text-red-400 font-medium transition-colors"
                              disabled={actionLoading}
                              onClick={() => handleRejectRequest(userId)}
                            >
                              <X size={16} className="inline mr-2" />
                              {actionLoading ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin inline mr-2"
                                />
                              ) : (
                                "Reject Request"
                              )}
                            </button>
                          </div>
                        ) : relationshipStatus === "outgoing" ? (
                          <div className="flex gap-2 flex-col">
                            <button
                              className="w-full bg-gray-700 py-2 rounded-md text-white font-medium cursor-not-allowed"
                              disabled
                            >
                              <Clock size={16} className="inline mr-2" />
                              Request Sent
                            </button>
                            <button
                              onClick={() => handleCancelRequest(userId)}
                              disabled={cancelLoading}
                              className="w-full bg-transparent border border-red-500 hover:bg-red-800/20 py-2 rounded-md text-red-400 font-medium transition-colors"
                            >
                              <X size={16} className="inline mr-2" />
                              {cancelLoading ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin inline mr-2"
                                />
                              ) : (
                                "Cancel Request"
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-col">
                            <button
                              onClick={() => handleSendRequest(userId)}
                              disabled={connectionLoading}
                              className="w-full bg-teal-600 hover:bg-teal-700 py-2 rounded-md text-white font-medium transition-colors"
                            >
                              {connectionLoading ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin inline mr-2"
                                />
                              ) : (
                                <UserPlus size={16} className="inline mr-2" />
                              )}
                              Connect with {profileData?.nickname}
                            </button>
                            <button className="w-full bg-transparent border border-teal-500 hover:bg-teal-800/20 py-2 rounded-md text-teal-400 font-medium transition-colors">
                              <Send size={16} className="inline mr-2" />
                              Send Message
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Friends List */}
                  <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Users size={18} />
                      Friends (
                      {profileData?.friends.length > 0
                        ? profileData?.friends.length
                        : "No friends yet"}
                      )
                    </h3>

                    <div className="space-y-3">
                      {profileData?.friends.slice(0, 4).map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-3"
                        >
                          {friend.user.profilePicture ? (
                            <img
                              src={friend.user.profilePicture.url}
                              alt={friend.user.username}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                              +
                            </div>
                          )}
                          <Link
                            to={`/profile/${friend.user._id.toString()}`}
                            className="text-sm"
                          >
                            {friend.user.username}
                          </Link>
                        </div>
                      ))}
                    </div>

                    {profileData?.friends.length > 4 && (
                      <button className="w-full mt-3 text-sm text-teal-400 hover:text-teal-300 transition-colors">
                        View All Friends
                      </button>
                    )}
                  </div>

                  {/* Friend Requests */}
                  {isAuthor && (
                    <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <UserPlus size={18} />
                        Friend Requests ({profileData?.friendRequests.length})
                      </h3>

                      <div className="space-y-4">
                        {incomingRequest.length > 0 &&
                          incomingRequest.map((request) => (
                            <div
                              key={request.sender.id}
                              className="flex items-center gap-3"
                            >
                              <Avatar className={"w-8 h-8"}>
                                <AvatarImage
                                  src={request.sender.profilePicture.url}
                                />
                                <AvatarFallback>
                                  {request.sender.username}
                                </AvatarFallback>
                              </Avatar>
                              <Link
                                className="text-md flex-1 cursor-pointer hover:underline"
                                to={`/profile/${request.sender.id}`}
                              >
                                {request.sender.username}
                              </Link>
                              <div className="flex gap-1">
                                <Button
                                  className=" bg-teal-600 hover:bg-teal-700 rounded cursor-pointer"
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptRequest(request.sender.id)
                                  }
                                  disabled={messageLoading}
                                >
                                  {messageLoading ? "Accepting..." : "Accept"}
                                </Button>
                                <Button
                                  className=" bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                                  variant={"outline"}
                                  size="sm"
                                  onClick={() =>
                                    handleRejectRequest(request.sender.id)
                                  }
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? "Rejecting..." : "Reject"}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Sent Requests */}
                  {isAuthor && (
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Send size={18} />
                        Sent Requests (
                        {profileData?.sentFriendRequests?.length || 0})
                      </h3>

                      <div className="space-y-3">
                        {sendRequest?.length > 0 &&
                          sendRequest.map((request) => (
                            <div
                              key={request.reciever.id}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={request.reciever.profilePicture.url}
                                alt={request.reciever.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <Link
                                className="text-sm flex-1"
                                to={`/profile/${request.reciever.id}`}
                              >
                                {request.reciever.username}
                              </Link>
                              <Button
                                className=""
                                variant="outline"
                                size="sm"
                                disabled={cancelLoading}
                                onClick={() =>
                                  handleCancelRequest(request.reciever.id)
                                }
                              >
                                {cancelLoading ? (
                                  <Loader2 className="animate-spin text-xs text-center mx-auto " />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
