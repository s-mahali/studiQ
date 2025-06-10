import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import LeftSideBar from "@/components/LeftSideBar";
import Layout from "@/lib/Layout";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

const HomePage = () => {
  const user = useSelector((state) => state.auth.user);
  const isLogin = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

  return (
    <div className="flex-col">
      {isLogin ? <LeftSideBar /> : <Header />}
      <main className= {` ${isLogin ? "ml-0 md:ml-16" : "md:w-full"} min-h-screen`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
