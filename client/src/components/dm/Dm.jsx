import { useRef, useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Phone,
  SendHorizontal,
  Video,
  Smile,
  Paperclip,
  Info,
  ThumbsUp,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { Input } from "../ui/input";
import { useParams } from "react-router-dom";
import { fetchDm, fetchUserProfile, sendDm } from "@/services/api.services";
import { useDispatch, useSelector } from "react-redux";
import useGetRTM from "@/hooks/useGetRTM";
import { setMessages } from "@/redux/slicers/chatSlice";
import { format, isToday, isYesterday } from "date-fns";
import useGetAllMessages from "@/hooks/useGetAllMessages";

const Dm = ({receiverId, onBack}) => {
  useGetAllMessages(receiverId);
  useGetRTM();
  const chatRef = useRef(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const messages = useSelector((state) => state.chat.messages);
  const currentUser = useSelector((state) => state.auth.user);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);

  const dispatch = useDispatch();

  // Scroll to bottom when message changes

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Simple date formatting
  const formatMessageDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", timestamp);
        return "";
      }

      if (isToday(date)) {
        return format(date, "h:mm a");
      } else if (isYesterday(date)) {
        return "Yesterday at " + format(date, "h:mm a");
      } else {
        return format(date, "dd-MM-yyyy h:mm a");
      }
    } catch (error) {
      console.error("Error while formatting date:", error);
    }
  };

  // Check if we should show date header
  const shouldShowDateHeader = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const date = new Date(currentMsg.createdAt);
    if (isNaN(date.getTime())) return false;
    const currentDate = new Date(currentMsg.createdAt);
    const prevDate = new Date(prevMsg.createdAt);

    return format(currentDate, "yyyy-MM-dd") !== format(prevDate, "yyyy-MM-dd");
  };

  // Format date header
  const formatDateHeader = (timestamp) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "d-MMMM-yyyy");
    }
  };

  // Send message handler
  const sendMessageHandler = async (e) => {
    try {
      e.preventDefault();
      if (!content.trim()) return;

      const response = await sendDm({ message: content }, receiverId);
      if (response?.status === 200) {
        dispatch(setMessages([...messages, response.data.payload]));
        setContent("");
      }
    } catch (error) {
      console.error("Error while sending message", error.message);
    }
  };

  // Fetch receiver details
  useEffect(() => {
    const fetchReceiverDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetchUserProfile(receiverId);
        if (res?.status === 200) {
          setReceiver(res.data.payload);
        }
      } catch (error) {
        console.error("Error while fetching receiver", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReceiverDetails();
  }, [receiverId]);

  // Check if receiver is online
  useEffect(() => {
    if (onlineUsers) {
      setIsOnline(onlineUsers.includes(receiverId));
    }
  }, [onlineUsers, receiverId]);

  return (
    <div className="flex min-h-screen bg-slate-900 flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 p-3 md:p-4">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile */}
          <Button
            onClick={onBack}
            className="md:hidden p-1 hover:bg-slate-700"
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="relative">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={receiver?.profilePicture?.url || "/placeholder.svg"}
              />
              <AvatarFallback className="bg-teal-600 text-white">
                {receiver?.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-800 bg-green-500"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white truncate text-sm md:text-base">
              {receiver?.username}
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden">
          <Button
            onClick={() => setShowMobileActions(!showMobileActions)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <MoreVertical className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Mobile Action Menu */}
      {showMobileActions && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 p-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white flex-1"
            >
              <Info className="h-4 w-4 mr-2" />
              Info
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="bg-slate-900 flex-1" ref={chatRef}>
        <div className="space-y-1 p-3 md:p-4">
          {messages &&
            messages.map((message, index) => {
              const showDateHeader = shouldShowDateHeader(
                message,
                messages[index - 1]
              );
              const isCurrentUser = message?.sender?._id === currentUser._id;

              return (
                <div key={message._id}>
                  {/* Date Header */}
                  {showDateHeader && (
                    <div className="flex justify-center py-2 md:py-4">
                      <div className="rounded-md bg-slate-700 px-2 md:px-3 py-1">
                        <span className="text-xs font-medium text-slate-300">
                          {formatDateHeader(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-start space-x-2 md:space-x-3 rounded-md p-2 hover:bg-slate-800/50"
                  >
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                      <AvatarImage
                        src={
                          message?.sender?.profilePicture?.url ||
                          "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="bg-teal-600 text-white">
                        {message?.sender?.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-white text-sm md:text-base truncate">
                          {message?.sender?.username}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatMessageDate(message?.createdAt)}
                        </span>
                      </div>

                      <div className="text-slate-300 text-sm md:text-base break-words">
                        {message?.content}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-slate-800 bg-slate-800 p-3 
      md:p-4 mb-15 lg:mb-0">
        <form
          onSubmit={(e) => sendMessageHandler(e)}
          className="flex items-center space-x-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-400 hidden md:flex"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="relative flex-1">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Message ${receiver?.username || "user"}...`}
              className="border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-teal-500 text-sm md:text-base pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hidden md:flex"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!content.trim()}
            className="bg-teal-600 hover:bg-teal-700 cursor-pointer px-3 md:px-4"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Dm;
