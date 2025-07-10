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

const Groupchat = ({ groupId }) => {
  const socket = useSelector((state) => state.socketio.socket);
  const user = useSelector((state) => state.auth.user);
  const { groupMessages } = useSelector((store) => store.group);
  console.log("groupMessages", groupMessages);
  const dispatch = useDispatch();
  const chatRef = useRef(null);
  const [input, setInput] = useState("");

  // fetch messsage history
  useEffect(() => {
    const fetchGroupChatMessage = async () => {
      try {
        const res = await fetchGroupChat(groupId, "general");
        if (res?.status === 200) {
          dispatch(setGroupMessage(res?.data.messages));
          console.log("message history", res.data.messages);
        }
      } catch (error) {
        console.error("error fetching groupChat", error?.message);
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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [groupMessages]);

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
  return (
    <>
      <ScrollArea className={"p-4"} viewportRef={chatRef} style={{ height: 'calc(100vh - 100px)' }} >
        <div  className="space-y-4">
          {groupMessages?.map((message) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className={"h-9 w-9"}>
                <AvatarImage
                  src={message.sender.profilePicture.url}
                  className={"object-fill"}
                />
                <AvatarFallback className={"bg-slate-700 text-teal-300"}>
                  {message?.sender?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline">
                  <span className={`font-medium  ${
                    user?._id == message?.sender._id ? "text-purple-600" : "text-teal-300"
                  }`}>
                    {message.sender.username}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {formatTime(message.createdAt)}
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
        <form className="flex gap-2" onSubmit={handleSend}>
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
    </>
  );
};

export default Groupchat;

//TODO 
//username color based on owner sender receiver 
//loading state for message history rendering
//currentgroup highlight
//loading state when redirecting to another group
//group member fetch with loading state 

