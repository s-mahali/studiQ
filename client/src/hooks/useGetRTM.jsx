import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/slicers/chatSlice";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socketio.socket);
  const messages = useSelector((state) => state.chat.messages);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        dispatch(setMessages([...messages, newMessage]));
      });
    }
    return () => {
      if (socket) {
        socket.off("newMessage");
      }
    };
  }, [dispatch, socket]);
};

export default useGetRTM;
