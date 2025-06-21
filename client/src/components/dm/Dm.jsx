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
} from "lucide-react";
import { Input } from "../ui/input";
import { useParams } from "react-router-dom";
import { fetchDm, fetchUserProfile, sendDm } from "@/services/api.services";
import { useDispatch, useSelector } from "react-redux";
import useGetRTM from "@/hooks/useGetRTM";
import { setMessages } from "@/redux/slicers/chatSlice";
import { format, isToday, isYesterday, set } from "date-fns";
import { current } from "@reduxjs/toolkit";

const Dm = () => {
  useGetRTM();
  const chatRef = useRef(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const messages = useSelector((state) => state.chat.messages);
  console.log("messages --------->", messages);
  const currentUser = useSelector((state) => state.auth.user);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const dispatch = useDispatch();
  const { receiverId } = useParams();

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
        const newMessage = response?.data.payload;
        dispatch(
          setMessages([
            ...(Array.isArray(messages) ? messages : []),
            newMessage,
          ])
        );
        setContent("");
      }
    } catch (error) {
      console.error("Error while sending message", error.message);
    }
  };

  // Fetch messages
  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        setIsLoading(true);
        const res = await fetchDm(receiverId);
        if (res?.status === 200) {
          console.log("message fetch successfully");
          dispatch(setMessages(res.data.payload));
        }
      } catch (error) {
        console.error("Error while fetching dm", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMessage();
  }, [receiverId, dispatch, setMessages]);

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
    <div className="flex h-screen bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={receiver?.profilePicture?.url || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-blue-600 text-white">
                  {receiver?.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-800 bg-green-500"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">{receiver?.username}</h2>
              <p className="text-sm text-gray-400">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-gray-900" ref={chatRef}>
          <div className="space-y-1 p-4">
            {Array.isArray(messages) &&
              messages.length > 0 &&
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
                      <div className="flex justify-center py-4">
                        <div className="rounded-md bg-gray-700 px-3 py-1">
                          <span className="text-xs font-medium text-gray-300">
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
                      className="group flex items-start space-x-3 rounded-md p-2 hover:bg-gray-800/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            message?.sender?.profilePicture?.url ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {message?.sender?.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-semibold text-white">
                            {message?.sender?.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatMessageDate(message?.createdAt)}
                          </span>
                        </div>

                        <div className="text-gray-300">{message?.content}</div>

                        {/* Message Reactions (randomly shown for demo) */}
                        {/* {Math.random() > 0.8 && (
                          <div className="flex items-center space-x-1 pt-1">
                            <div className="flex items-center space-x-1 rounded-md bg-gray-700 px-2 py-1">
                              <ThumbsUp className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-gray-300">1</span>
                            </div>
                          </div>
                        )} */}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <form
            onSubmit={(e) => sendMessageHandler(e)}
            className="flex items-center space-x-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="relative flex-1">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Message ${receiver?.username || "user"}...`}
                className="border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dm;
