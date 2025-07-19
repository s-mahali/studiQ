import React, { useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";

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
import { setNotification, setOnlineUsers } from "./redux/slicers/chatSlice";
import StudyZonePage from "./pages/StudyZonePage";
import CurrentGroupPage from "./pages/CurrentGroupPage";
import Studyzone from "./components/studyzone/Studyzone";
import PeerConnection from "./webrtc/Peer";
import MemberSideBar from "./components/dm/MemberSideBar";
import ProtectedRoutes from "./components/ProtectedRoutes";

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
        element: <ProtectedRoutes><FindPeersPage /></ProtectedRoutes>,
      },
      {
        path: "/profile/:userId",
        element: <ProtectedRoutes><StudyProfilePage /></ProtectedRoutes>,
      },
      {
        path: "/edit-profile",
        element: <ProtectedRoutes><EditProfilePage /></ProtectedRoutes>,
      },
      
      {
        path: "/study-zone/",
        element: <ProtectedRoutes><CurrentGroupPage /></ProtectedRoutes>,
        children: [
          {
            path: ":groupId",
            element: <ProtectedRoutes>
              <Studyzone/>
            </ProtectedRoutes>
          }
        ]
      },

      {
        path: "/dm/:userId",
        element: <ProtectedRoutes><MemberSideBar /></ProtectedRoutes>,
      },
      {
        path: "/webrtc",
        element: <ProtectedRoutes><PeerConnection /></ProtectedRoutes>,
      }
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
      const socketio = io("import.meta.env.VITE_SOCKET_URL", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });

      dispatch(setSocket(socketio));
      //listen all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification", (notification) => {
        dispatch(setNotification(notification));
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
