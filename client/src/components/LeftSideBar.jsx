import { BookOpen,  LogOut,  PlusSquare,  UserLock } from 'lucide-react';
import React, {useState} from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLocation } from 'react-router-dom';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import {Link} from "react-router-dom"
import {cn} from "@/lib/utils"
import {motion} from "framer-motion"
import { useSelector } from 'react-redux';

const LeftSideBar = () => {
    const [hoverItem, setHoveredItem] = useState(null);
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const sidebarItems = [
    {
      icon: (
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={"https://github.com/shadcn.png"}
            alt="user"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
      path: `/profile/${user._id}`
    },
    
    {
      icon: <BookOpen size={22} />,
      text: "StudyZone",
      path: "/studyzone"
    },
    {
      icon: <UserLock />,
      text: "FindPeers",
      path: "/find-peers"
    },
    
    {
      icon: <PlusSquare />,
      text: "Create",
      path: "/create"
    },
    
    {
      icon: <LogOut />,
      text: "Logout",
    },
  ];
  return (
   <>
   {/* Desktop sidebar */}
    <div className="hidden md:flex flex-col items-center w-16 h-screen fixed left-0 top-0 bg-gray-900 border-r border-gray-800 py-4">
    <div className="flex flex-col items-center space-y-6 w-full">
      {
        sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
                 <TooltipProvider key={index} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to={item.path}
                      className="relative w-full flex justify-center"
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div 
                        className={cn(
                          "p-3 rounded-md transition-all duration-200 group",
                          isActive 
                            ? "bg-teal-600 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        {item.icon}
                        
                        {/* Pill indicator for active item */}
                        {isActive && (
                          <motion.div 
                            className="absolute left-0 w-1 h-8 bg-white rounded-full"
                            layoutId="sidebar-indicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
        })
      }
    </div>
    </div>

     {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex justify-around items-center px-2 py-3">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                to={item.path} 
                key={index}
                className={cn(
                  "flex flex-col items-center py-1 px-3 rounded-md transition-all",
                  isActive 
                    ? "text-teal-400" 
                    : "text-gray-400"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div 
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-teal-400 rounded-full"
                      layoutId="mobile-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                <span className="text-xs mt-1">{item.text}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Add padding to content on mobile to account for bottom bar */}
      <div className="md:hidden pb-16" /> 
   </>
  )
}

export default LeftSideBar