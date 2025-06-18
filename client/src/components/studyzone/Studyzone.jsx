import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
  FileUp,
  Headphones,
  MessageSquare,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  SendHorizontal,
  Settings,
  Share,
  Users,
  Video,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";

const Studyzone = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMuted, setIsmuted] = useState(false);
  const [message, setMessage] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const chatRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  

  //sample static data
  const groups = [
    { id: 1, name: "Math Study", image: null },
    { id: 2, name: "CS Group", image: null },
    { id: 3, name: "Physics Lab", image: null },
    { id: 4, name: "Chemistry", image: null },
  ];

  const members = [
    {
      id: 1,
      name: "Alex Smith",
      status: "online",
      isSpeaking: true,
      image: null,
    },
    {
      id: 2,
      name: "Jamie Rodriguez",
      status: "online",
      isSpeaking: false,
      image: null,
    },
    {
      id: 3,
      name: "Taylor Kim",
      status: "idle",
      isSpeaking: false,
      image: null,
    },
    {
      id: 4,
      name: "Jordan Lee",
      status: "offline",
      isSpeaking: false,
      image: null,
    },
    {
      id: 5,
      name: "Casey Johnson",
      status: "online",
      isSpeaking: false,
      image: null,
    },
  ];

  const messages = [
    {
      id: 1,
      user: "Alex Smith",
      content: "Hey everyone! Who's joining the study session today?",
      time: "10:30 AM",
      image: null,
    },
    {
      id: 2,
      user: "Jamie Rodriguez",
      content: "I'll be there in 5 minutes, just finishing up some notes.",
      time: "10:32 AM",
      image: null,
    },
    {
      id: 3,
      user: "Taylor Kim",
      content:
        "Could someone help me with problem set #4? I'm stuck on the third question.",
      time: "10:35 AM",
      image: null,
    },
    {
      id: 4,
      user: "Alex Smith",
      content: "Sure, we can review it together when we start the session.",
      time: "10:38 AM",
      image: null,
    },
    {
      id: 5,
      user: "Casey Johnson",
      content:
        "I found this really helpful article about today's topic: https://example.com/study-resource",
      time: "10:40 AM",
      image: null,
    },
  ];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  const toggleMute = () => setIsmuted(!isMuted);
  const toggleCall = () => setIsInCall(!isInCall);

  return (
    <div className=" min-h-screen bg-slate-900 flex overflow-hidden">
      {/* Group selection sidebar */}
      <motion.div
        className="bg-gray-900 border-r border-gray-700  w-18 flex flex-col flex-shrink-0  items-center py-4"
        initial={{ width: 72 }}
        animate={{ width: 72 }}
        transition={{ duration: 0.2 }}
      >
        {groups.map((group, i) => (
          <TooltipProvider key={group.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-all ${
                    activeGroup === i
                      ? "bg-teal-600"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveGroup(i)}
                >
                  {group.image ? (
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {group.name.substring(0, 2)}
                    </span>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">{group.name}</TooltipContent>
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
                {/* {groups[activeGroup.name]} */} collab
              </h2>
              <p className="text-slate-400 text-sm">
                Study together, learn better
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

            {isInCall && (
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
            )}
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={"text-slate-400 hover:text-white"}
                  >
                    <Settings size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* Chat Messages */}

        <ScrollArea className={"flex-1 p-4"} ref={chatRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className={"h-9 w-9"}>
                  <AvatarImage src={message.image}>
                    <AvatarFallback className={"bg-slate-700 text-teal-300"}>
                      {message.user.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </AvatarImage>
                </Avatar>
                <div>
                  <div className="flex items-baseline">
                    <span className="font-medium text-teal-300">
                      {message.user}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-slate-300">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input  */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <form className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-teal-300"
            >
              <FileUp size={18} />
            </Button>
            <Input
              type="text"
              value={message}
              //onchange={}
              placeholder="Send a message..."
              className={
                "bg-slate-700 border-slate-600 focus-visible:ring-0 text-white"
              }
            />
            <Button
              type="submit"
              size="icon"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <SendHorizontal size={18} />
            </Button>
          </form>
        </div>

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
      </div>

      {/* Memebers Sidebar */}
      <motion.div
        className="bg-slate-800 border-l border-slate-700 w-60 flex-shrink-0 hidden md:block"
        initial={{ width: 240 }}
        animate={{ width: 240 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Users className="mr-2" size={18} /> Members
          </h3>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2">
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1">
              ONLINE — {members.filter((m) => m.status === "online").length}
            </h4>
            {members
              .filter((m) => m.status === "online")
              .map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-slate-700 text-teal-300">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-300 text-sm">{member.name}</span>
                </motion.div>
              ))}
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1 mt-4">
              OFFLINE — {members.filter((m) => m.status === "offline").length}
            </h4>
            {members
              .filter((m) => m.status === "offline")
              .map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-slate-700 text-gray-500">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gray-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-500 text-sm">{member.name}</span>
                </motion.div>
              ))}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default Studyzone;
