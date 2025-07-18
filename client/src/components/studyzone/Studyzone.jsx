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
  Bot,
  Brain,
  Coffee,
  EditIcon,
  Headphones,
  MessageCircleCode,
  MessageSquare,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Share,
  Speaker,
  UserPlus,
  Users,
  Video,
  Volume2,
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
import {
  setGroupMessage,
  setCurrentGroupId,
  setGroupMembers,
} from "@/redux/slicers/groupSlice";
import MultiVc from "@/webrtc/Multy_party_vc";
import Aiwindow from "../ai/Aiwindow";

const Studyzone = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  //fetchgroup state
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const [isChatwindowOpen, setIsChatwindowOpen] = useState(true);
  const [isVcWindowOpen, setIsVcWindowOpen] = useState(false);
  const [isAiWindowOpen, setIsAiWindowOpen] = useState(false);
  const [totalOnlineUsers, setTotalOnlineUsers] = useState(0);
  const [isOwner, setIsowner] = useState(false);
  const [showSideBar, setShowSideBar] = useState(true);
  
  // State to track if screen is mobile or tablet size
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Update mobile/tablet state on window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 768);
    };
    
    // Set initial value
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { groupId } = useParams();
  const { userGroups } = useSelector((store) => store.group);
  const navigate = useNavigate();
  console.log("aiwindow", isAiWindowOpen);
  const {onlineUsers} = useSelector((store) => store.chat);
  const {groupMembers} = useSelector((store) => store.group);

  const handleGroupClick = (id) => {
    navigate(`/study-zone/${id}`);
  };

  // Function to handle tab switching with auto-collapse
  const handleTabSwitch = (tabType) => {
    if (tabType === 'chat') {
      setIsChatwindowOpen(true);
      setIsVcWindowOpen(false);
      setIsAiWindowOpen(false);
    } else if (tabType === 'voice') {
      setIsVcWindowOpen(true);
      setIsChatwindowOpen(false);
      setIsAiWindowOpen(false);
    } else if (tabType === 'ai') {
      setIsAiWindowOpen(true);
      setIsChatwindowOpen(false);
      setIsVcWindowOpen(false);
    }
    
    // Auto-collapse sidebar on mobile/tablet
    if (isMobileOrTablet) {
      setSidebarCollapsed(true);
    }
  };

  //set groupId and activeGroup
  useEffect(() => {
    if (groupId) {
      dispatch(setCurrentGroupId(groupId));
    }
    const activeGroup = userGroups.find((group) => group._id === groupId);
    setActiveGroup(activeGroup);
    if(activeGroup?.members?.some((member) => member.userId._id === user._id && member.role === "owner")){
       setIsowner(true);
    }
  }, [groupId, dispatch]);
   

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
      } finally {
        setIsMemberLoading(false);
      }
    };
    fetchUserGroupById();
  }, [groupId]);


  //total online users 
  useEffect(() => {
      const totalOnlineUsers =   groupMembers.filter((member) => onlineUsers.includes(member.userId._id)).length;
      setTotalOnlineUsers(totalOnlineUsers);
    },[onlineUsers, groupMembers, groupId]);

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
                          activeGroup?._id === group?._id
                            ? "bg-teal-600"
                            : "bg-slate-800"
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
                className="w-full justify-start mb-1 text-slate-300 text-md"
                onClick={() => handleTabSwitch('chat')}
              >
                <MessageCircleCode className="mr-2" />
                Team Chat
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300 text-md"
                onClick={() => handleTabSwitch('voice')}
              >
                <Volume2 className="mr-2 " />
                Start Discussion
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300 text-md"
              >
                <Share className="mr-2" />
                Share Resources
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-slate-300 text-md"
                onClick={() => handleTabSwitch('ai')}
              >
                <Brain className="mr-2" />
                AI Assistance
              </Button>
            </nav>

            <Separator className="bg-slate-700 my-2" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main content Area  */}
      <div className="flex-1 flex flex-col ">
        {/* Header  */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant={"ghost"}
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={"mr-2 text-white-400 hover:text-white "}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={24} className="font-bold" />   
              ) : (
                <PanelLeftClose size={24} className="font-bold" /> 
              )}
            </Button>
            <h2 className="text-white text-xl font-mono font-medium">{isAiWindowOpen ? ("AI Code Assistant") : "# General" }</h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={"outline"}
              className={"bg-slate-700/50 text-teal-300 border-teal-800 font-mono"}
            >
              {isAiWindowOpen ? <Bot className="w-8 h-8 text-teal-400 "/> : `${totalOnlineUsers} online`}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={"text-slate-400 hover:text-white"}
                >
                  {isOwner && <Settings size={18} />}
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
       { /* Chat Messages Component */}
        {isChatwindowOpen && <Groupchat groupId={groupId} />}
       
        {isAiWindowOpen && <Aiwindow groupId={groupId} />}
        {/* Voice controls (shown only when in a call) */}
        {isVcWindowOpen && <MultiVc groupId={groupId} />}
      </div>{" "}
      <GroupMembers groupId={groupId} isLoading={isMemberLoading} />

      {/* //Edit Group and add memeber components */}
      { isOwner && 
        <>
        <EditGroupDialogue
        open={showEditGroup}
        setOpen={setShowEditGroup}
        groupId={activeGroup?._id}
        groupData={activeGroup}
      />
      <AddMemberDialog
        open={showAddMember}
        setOpen={setShowAddMember}
        groupId={activeGroup}
      />
        </>
      }
    </div>
  );
};

export default Studyzone;
