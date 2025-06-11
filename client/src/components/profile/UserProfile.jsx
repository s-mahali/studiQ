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
} from "lucide-react";
import {
  editProfilePic,
  fetchUserProfile,
  userLogout,
} from "@/services/api.services";
import { setAuthUser, setStatus } from "@/redux/slicers/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export default function StudyProfilePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPfpOpen, setEditPfpOpen] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [pfpUrl, setPfpUrl] = useState("");
  const pfpRef = useRef();
  const [pfpLoading, setPfpLoading] = useState(false);
  const { userId } = useParams();
  console.log(userId, "userID");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authorId = useSelector((state) => state.auth.user?._id);
  const isAuthor = authorId === userId;

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPfpUrl(file);
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchProfileData() {
      try {
        if (!userId) {
          toast.error("Invalid user ID");
          setLoading(false);
          return;
        }
        const response = await fetchUserProfile(userId);
        if (response?.status === 200) {
          console.log(response?.data?.payload, "userProfiledata");
          setProfileData(response?.data.payload);
          toast.success(response.data.message);
          if (userId === authorId) {
            dispatch(setAuthUser(response.data.payload));
          }
        }
      } catch (error) {
        toast.error(error.response.data.message);
        navigate("/");
      } finally {
        setLoading(false);
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
        dispatch(setStatus(false));
      }
    } catch (error) {
      toast.error(error.response.data.message || "something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-10 w-10 h-10 text-teal-400" />
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
                        <button className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer">
                          Connect
                        </button>
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
                            {profileData?.activity.progress || []}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full mb-6">
                          <div
                            className="h-2 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full"
                            style={{
                              width: `${profileData?.activity.progress}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <div className="text-gray-400">
                              Total Study Time
                            </div>
                            <div className="text-lg font-semibold">
                              {profileData?.activity.totalStudyTime}
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
                      {profileData?.groups.map((group) => (
                        <div
                          key={group.id}
                          className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between"
                        >
                          <span>{group.name}</span>
                          <button className="text-teal-400 hover:text-teal-300 transition-colors">
                            View
                          </button>
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
                        <button className="w-full bg-teal-600 hover:bg-teal-700 py-2 rounded-md text-white font-medium transition-colors mb-3">
                          <UserPlus size={16} className="inline mr-2" />
                          Connect with {profileData?.nickname}
                        </button>
                        <button className="w-full bg-transparent border border-teal-500 hover:bg-teal-800/20 py-2 rounded-md text-teal-400 font-medium transition-colors">
                          <Send size={16} className="inline mr-2" />
                          Send Message
                        </button>
                      </div>
                    </>
                  )}

                  {/* Friends List */}
                  <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Users size={18} />
                      Friends (
                      {profileData?.friends.length > 0
                        ? profileData?.friends.length - 1
                        : "No friends yet"}
                      )
                    </h3>

                    <div className="space-y-3">
                      {profileData?.friends.slice(0, 4).map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-3"
                        >
                          {friend.picture ? (
                            <img
                              src={friend.picture}
                              alt={friend.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                              +
                            </div>
                          )}
                          <span className="text-sm">{friend.name}</span>
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
                  {
                    isAuthor && (
                      <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <UserPlus size={18} />
                      Friend Requests ({profileData?.friendRequests.length})
                    </h3>

                    <div className="space-y-4">
                      {profileData?.friendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={request.picture}
                            alt={request.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm flex-1">{request.name}</span>
                          <div className="flex gap-1">
                            <button className="p-1 bg-teal-600 hover:bg-teal-700 rounded text-xs">
                              Accept
                            </button>
                            <button className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                              Ignore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    )
                  }

                  {/* Sent Requests */}
                 {
                  isAuthor && (
                     <div className="bg-gray-800/60 rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Send size={18} />
                      Sent Requests ({profileData?.sentRequests?.length || 0})
                    </h3>

                    <div className="space-y-3">
                      {profileData?.sentRequests &&
                        profileData.sentRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={request.picture}
                              alt={request.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm flex-1">
                              {request.name}
                            </span>
                            <button className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                              Cancel
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                  )
                 }
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
