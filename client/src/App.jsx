import React from "react";
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


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage/>,
    children: [
         {
          path: "/",
          element: <Layout/>
         },
         {
          path: "/find-peers",
          element: <FindPeersPage/>
         },
         {
          path: "/profile/:userId",
          element: <StudyProfilePage/>
         },
         {
          path: "/edit-profile",
          element: <EditProfilePage/>
         }
    ]
  },
  {
    path: "/signup",
    element: <SignupPage/>
  },
  {
    path: "/login",
    element: <LoginPage/>
  },{
    path: "/verify-email",
    element: <VerifyEmail/>
  }
])

const App = () => {
  return (
    <>
      <RouterProvider router={browserRouter} />
      <Toaster/>
    </>
  );
};

export default App;
