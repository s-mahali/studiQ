import React, { useRef, useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FileUp, SendHorizontal } from "lucide-react";
import { Input } from "../ui/input";
import { useParams } from "react-router-dom";
import { sendDm } from "@/services/api.services";
import { useSelector } from "react-redux";

// const messages = [
//   {
//     id: 1,
//     user: "Alex Smith",
//     content: "Hey everyone! Who's joining the study session today?",
//     time: "10:30 AM",
//     image: null,
//   },
//   {
//     id: 2,
//     user: "Jamie Rodriguez",
//     content: "I'll be there in 5 minutes, just finishing up some notes.",
//     time: "10:32 AM",
//     image: null,
//   },
//   {
//     id: 3,
//     user: "Taylor Kim",
//     content:
//       "Could someone help me with problem set #4? I'm stuck on the third question.",
//     time: "10:35 AM",
//     image: null,
//   },
//   {
//     id: 4,
//     user: "Alex Smith",
//     content: "Sure, we can review it together when we start the session.",
//     time: "10:38 AM",
//     image: null,
//   },
//   {
//     id: 5,
//     user: "Casey Johnson",
//     content:
//       "I found this really helpful article about today's topic: https://example.com/study-resource",
//     time: "10:40 AM",
//     image: null,
//   },
// ];

const Dm = () => {
  
  const chatRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { receiverId } = useParams();
  const socket = useSelector((state) => state.socketio.socket);
  console.log("receiverId", receiverId);

  useEffect(() => {
    socket?.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    })
    return () =>  socket?.off("newMessage");
  },[])

  const sendMessageHandler = async (e, receiverId) => {
    try {
      e.preventDefault();
      const response = await sendDm({message}, receiverId);
      console.log("response", response);
      if (response?.status === 200) {
        setMessage("");
        
      }
    } catch (error) {
      console.error("error while sending message", error.message);
    }
  };
  return (
    // chat message
    <>
      <ScrollArea className={"flex-1 p-4"} ref={chatRef}>
        <div className="space-y-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className={"h-9 w-9"}>
                <AvatarImage src={m.image}>
                  <AvatarFallback className={"bg-slate-700 text-teal-300"}>
                    {m.user.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </AvatarImage>
              </Avatar>
              <div>
                <div className="flex items-baseline">
                  <span className="font-medium text-teal-300">{m.user}</span>
                  <span className="ml-2 text-xs text-slate-500">{m.time}</span>
                </div>
                <p className="text-slate-300">{m.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input  */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <form
          className="flex gap-2"
          onSubmit={(e) => sendMessageHandler(e,receiverId)}
        >
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
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="bg-slate-700 border-slate-600 focus-visible:ring-0 text-white"
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

export default Dm;
