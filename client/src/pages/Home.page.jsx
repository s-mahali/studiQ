import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import LeftSideBar from "@/components/LeftSideBar";
import Layout from "@/lib/Layout";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";


const HomePage = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  

  return (
    <div className="flex flex-col min-h-screen">
      {user ? <LeftSideBar /> : <Header />}
      <main className= {` ${user ? "ml-0 md:ml-16" : "md:w-full"}`}>
        <Outlet />
      </main>
      {user ? <></> : <Footer/>}
    </div>
  );
};

export default HomePage;
