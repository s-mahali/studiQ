import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDm } from "../services/api.services";
import { setMessages } from "../redux/slicers/chatSlice";

const useGetAllMessages = (receiverId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetchDm(receiverId);

        if (res.data.success) {
          dispatch(setMessages(res.data.payload));
        }
      } catch (err) {
        console.log("error while fetching messages", err);
      }
    };
    fetchMessages();
  }, [receiverId, dispatch]);
};

export default useGetAllMessages;
