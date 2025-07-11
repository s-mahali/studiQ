import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  BookOpen,
  Coffee,
  EditIcon,
  Headphones,
  MessageSquare,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Share,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { fetchGroupById, fetchGroupChat } from "@/services/api.services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EditGroupDialogue from "../group/EditGroupDialogue";
import AddMemberDialog from "../group/AddMemberDialog";
import Groupchat from "../group/groupchat/Groupchat";
import GroupMembers from "../group/groupchat/GroupMembers";
import { useNavigate, useParams } from "react-router-dom";
import { setGroupMessage, setCurrentGroupId, setGroupMembers } from "@/redux/slicers/groupSlice";

const Studyzone = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMuted, setIsmuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  //fetchgroup state
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { groupId } = useParams();
  const { userGroups } = useSelector((store) => store.group);
  const navigate = useNavigate();

  const handleGroupClick = (id) => {
    navigate(`/study-zone/${id}`);
  };

  const toggleMute = () => setIsmuted(!isMuted);
  const toggleCall = () => setIsInCall(!isInCall);

  //set groupId and activeGroup
  useEffect(() => {
    if (groupId) {
      dispatch(setCurrentGroupId(groupId));
    }
    const activeGroup = userGroups.find((group) => group._id === groupId);
    setActiveGroup(activeGroup);
  }, [groupId, dispatch]);
  console.log("activeGroup", activeGroup)
  console.log("groupId", groupId)

  //fetch group members by fetchGroupByID
  useEffect(() => {
    const fetchUserGroupById = async () => {
      setIsMemberLoading(true);
      try {
        const response = await fetchGroupById(groupId);
        if (response?.status === 200) {
          console.log("fetchUserGroupById", response?.data?.payload);
          dispatch(setGroupMembers(response?.data?.payload.members));
        }
      } catch (error) {
        console.error(error.message);
      }finally{
        setIsMemberLoading(false);
      }
    };
    fetchUserGroupById();
  }, [groupId]);

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      {/* Group selection sidebar */}
      <motion.div
        className="bg-gray-900 border-r border-gray-700 w-18 flex flex-col flex-shrink-0 items-center py-4"
        initial={{ width: 72 }}
        animate={{ width: 72 }}
        transition={{ duration: 0.2 }}
      >
        {userGroups &&
          userGroups.map((group, i) => (
            <TooltipProvider key={group._id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-all overflow-hidden ${
                      activeGroup?._id === group?._id
                        ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-teal-600"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGroupClick(group._id)}
                  >
                    {group.coverImage ? (
                      <img
                        src={group.coverImage.url}
                        alt={group.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          activeGroup?._id === group?._id ? "bg-teal-600" : "bg-slate-800"
                        }`}
                      >
                        <span className="text-lg font-bold text-white">
                          {group.title.substring(0, 2)}
                        </span>
                      </div>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">{group.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
      </motion.div>
      {/* action sidebar */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            className="bg-slate-800 border-r border-slate-700 w-60 flex-shrink-0"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={18} />
                {activeGroup?.title}
              </h2>
              <p className="text-slate-400 text-sm">
                {activeGroup?.description}
              </p>
            </div>
            <Separator className="bg-slate-700 my-2" />
            <nav className="p-2">
              <Button
                variant="ghost"
                className={`w-full justify-start mb-1 ${
                  isInCall ? "bg-teal-900/50 text-teal-300" : "text-slate-300"
                }`}
                onClick={toggleCall}
              >
                <Video className="mr-2 h-4 w-4" />
                {isInCall ? "Leave Study Room" : "Join Study Room"}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300"
              >
                <Share className="mr-2 h-4 w-4" />
                Share Resources
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300"
              >
                <Coffee className="mr-2 h-4 w-4" />
                Break Room
              </Button>
            </nav>

            <Separator className="bg-slate-700 my-2" />

            {/* {isInCall && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Currently in Voice Call
                </h3>
                <div className="space-y-2">
                  {members
                    .filter((m) => m.status === "online")
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="h-8 w-8 border border-slate-700">
                            <AvatarImage src={member.image} />
                            <AvatarFallback className="bg-slate-700 text-teal-300">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-800 ${
                              member.isSpeaking
                                ? "bg-teal-400 animate-pulse"
                                : "bg-emerald-500"
                            }`}
                          ></span>
                        </div>
                        <span className="text-sm text-slate-300">
                          {member.name}
                        </span>
                        {member.isSpeaking && (
                          <span className="ml-auto">
                            <Mic className="h-3 w-3 text-teal-400" />
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )} */}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main content Area  */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant={"ghost"}
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={"mr-2 text-slate-400 hover:text-white"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </Button>
            <h2 className="text-white font-medium"># general</h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={"outline"}
              className={"bg-slate-700/50 text-teal-300 border-teal-800"}
            >
              5 online
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={"text-slate-400 hover:text-white"}
                >
                  <Settings size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800 border-slate-700 text-slate-300"
              >
                <DropdownMenuItem
                  onClick={() => setShowEditGroup(true)}
                  className="cursor-pointer hover: bg-slate-700 hover:text-white"
                >
                  <EditIcon className="mr-2 h-4 w-4" />
                  <span>Edit Group</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  onClick={() => setShowAddMember(true)}
                  className="cursor-pointer hover:bg-slate-700 hover:text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Add Member</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Chat Messages Component */}
        <Groupchat groupId={groupId} />
        {/* Voice controls (shown only when in a call) */}
        {isInCall && (
          <motion.div
            className="p-3 bg-gray-900 border-t border-slate-700 flex items-center justify-center gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-10 w-10 ${
                      isMuted
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-teal-600 hover:bg-teal-700"
                    }`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleCall}
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 bg-red-500 hover:bg-red-600"
                  >
                    <Headphones size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Leave Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </div>{" "}
      <GroupMembers groupId = {groupId} isLoading = {isMemberLoading} />
      <EditGroupDialogue
        open={showEditGroup}
        setOpen={setShowEditGroup}
        groupId={activeGroup?._id}
        groupData={activeGroup?._id}
      />
      <AddMemberDialog
        open={showAddMember}
        setOpen={setShowAddMember}
        groupId={activeGroup?._id}
      />
    </div>
  );
};

export default Studyzone;
