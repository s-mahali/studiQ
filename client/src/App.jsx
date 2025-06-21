import React, { useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomePage from "./pages/Home.page";
import SignupPage from "./pages/Signup.page";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/Login.page";
import VerifyEmail from "./components/auth/VerifyEmail";
import Layout from "./lib/Layout";
import FindPeersPage from "./pages/FindPeers.page";
import StudyProfilePage from "./components/profile/UserProfile";
import EditProfilePage from "./pages/EditProfilePage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/slicers/socketSlice";
import { setOnlineUsers } from "./redux/slicers/chatSlice";
import StudyZonePage from "./pages/StudyZonePage";
import Dm from "./components/dm/dm";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      {
        path: "/",
        element: <Layout />,
      },
      {
        path: "/find-peers",
        element: <FindPeersPage />,
      },
      {
        path: "/profile/:userId",
        element: <StudyProfilePage />,
      },
      {
        path: "/edit-profile",
        element: <EditProfilePage />,
      },
      {
        path: "/study-zone",
        element: <StudyZonePage />,
      },

      {
        path: "/dm/:receiverId",
        element: <Dm />,
      },
    ],
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const socket = useSelector((state) => state.socketio.socket);
  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8080", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });

      console.log("socketioClient", socketio);
      dispatch(setSocket(socketio));
      //listen all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
      <Toaster />
    </>
  );
};

export default App;
