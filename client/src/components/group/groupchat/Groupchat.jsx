import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setAddNewMessage, setGroupMessage } from "@/redux/slicers/groupSlice";
import { fetchGroupChat, sendMessageInGroup } from "@/services/api.services";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileUp, RadioReceiverIcon, SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/formatTime";
import { Skeleton } from "@/components/ui/skeleton";

const Groupchat = ({ groupId }) => {
  const socket = useSelector((state) => state.socketio.socket);
  const user = useSelector((state) => state.auth.user);
  const { groupMessages } = useSelector((store) => store.group);
  console.log("groupMessages", groupMessages);
  const dispatch = useDispatch();
  const chatRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const { userGroups } = useSelector((store) => store.group);

  const [input, setInput] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  // fetch messsage history
  useEffect(() => {
    const fetchGroupChatMessage = async () => {
      setIsMessageLoading(true);
      try {
        const res = await fetchGroupChat(groupId, "general");
        if (res?.status === 200) {
          dispatch(setGroupMessage(res?.data.messages));
        }
      } catch (error) {
        console.error("error fetching groupChat", error?.message);
        setIsMessageLoading(false); // need to confirm this
      } finally {
        setIsMessageLoading(false);
      }
    };
    if (groupId) {
      fetchGroupChatMessage();
    }
    return () => {
      dispatch(setGroupMessage([]));
    };
  }, [groupId, dispatch]);

  //join/leave group room
  useEffect(() => {
    if (socket && user && groupId) {
      socket.emit("join-group", { groupId, userId: user._id });
      return () => {
        socket.emit("leave-group", { groupId, userId: user._id });
      };
    }
  }, [socket, user, groupId]);

  //Listen for new group messages
  useEffect(() => {
    if (!socket) return;

    socket.on("newGroupMessage", (data) => {
      dispatch(setAddNewMessage(data.message));
    });
    return () => {
      socket.off("newGroupMessage");
    };
  }, [socket, groupId, dispatch]);

  //auto-scroll to bottom
  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => {
     scrollToBottom();
  }, [groupMessages, isMessageLoading]);

  //send message
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      if (!input.trim()) {
        return;
      }
      const res = await sendMessageInGroup(groupId, "general", {
        content: input,
      });
      if (res?.status === 200) {
        setInput("");
      }

      console.log("message sent successfully");
    } catch (error) {
      console.error("Error while sending message", error?.message);
    }
  };

  //ownership
  useEffect(() => {
    const currentGroup = userGroups?.find((group) => group._id === groupId);
    setCurrentGroup(currentGroup);
    
  }, [userGroups, user, groupId]);



  return (
    <div className="">
      <ScrollArea
        className={"p-4"}
        ref={scrollAreaRef}
        style={{ height: "calc(100vh - 138px)" }}
      >
        <div className="space-y-4">
          {isMessageLoading ? (
             [1,2,3,4,5,6,7,8,9,10].map((item) => (
                <div className="flex items-center gap-x-4" key={item}>
                   <Skeleton className={"h-12 w-12 rounded-full"}/>
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-[250px]"/>
                     <Skeleton className="h-4 w-[250px]"/>
                   </div>
                </div>
             ))
          ) : (
            groupMessages && groupMessages?.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className={"h-9 w-9"}>
                  <AvatarImage
                    src={message.sender?.profilePicture?.url}
                    className={"object-fill"}
                  />
                  <AvatarFallback className={"bg-slate-700 text-teal-300"}>
                    {message?.sender?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-baseline">
                    <span
                      className={`font-medium  ${ currentGroup?.createdBy === message?.sender?._id ? "text-blue-600" :
                        user?._id == message?.sender?._id
                          ? "text-purple-600"
                          : "text-teal-300"
                      }`}
                    >
                      {message?.sender?.username}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {formatTime(message?.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-300">{message?.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div ref={chatRef}/>
      </ScrollArea>

      {/* Message Input  */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 mb-15 lg:mb-0 ">
        <form className="flex gap-2 " onSubmit={handleSend}>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
    </div>
  );
};

export default Groupchat;


