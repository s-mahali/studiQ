import React, { useEffect, useRef, useState } from 'react'
import {motion} from "framer-motion"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { Skeleton } from '@/components/ui/skeleton';




const GroupMembers = ({groupId, isLoading}) => {
  const {groupMembers} = useSelector((store) => store.group);
  const {onlineUsers} = useSelector((store) => store.chat);

  const [onlineMembers, setOnlineMembers] = useState([]);
  const [offlineMembers, setOfflineMembers] = useState([]);
  const memberRef = useRef(null);

   useEffect(() => {
      if (memberRef.current) {
        memberRef.current.scrollTop = memberRef.current.scrollHeight;
      }
    }, [groupMembers]);

  useEffect(() => {
      const onlineMembers = groupMembers?.filter((m) => onlineUsers.includes(m.userId._id));
      const offlineMembers = groupMembers?.filter((m) => !onlineUsers.includes(m.userId._id));
      setOnlineMembers(onlineMembers);
      setOfflineMembers(offlineMembers);
  },[groupMembers, onlineUsers]);
   
  console.log("onlineMembers", onlineMembers);
  console.log("offlineMembers", offlineMembers);
  
  return (
    <>
       {/* Memebers Sidebar */}
      <motion.div
        className="bg-slate-800 border-l border-slate-700 w-60 flex-shrink-0 hidden md:block overflow-y-auto"
        initial={{ width: 240 }}
        animate={{ width: 240 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Users className="mr-2" size={18} /> Members
          </h3>
        </div>
        <ScrollArea className="h-full" viewportRef={memberRef} 
          style={{height: "calc(100vh - 100px)"}}>
          <div className="p-2">
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1">
              ONLINE — {onlineMembers?.length}
            </h4>
           {
            isLoading ? 
            ( [1,2,3].map((item,i) => (
               <div className='flex flex-col p-1' key={i}>
                  <div className="flex items-center gap-x-4">
                   <Skeleton className={"h-8 w-8 rounded-full"}/>
                   <div className="space-y-2">
                     <Skeleton className="h-3 w-[200px]"/>
                     
                   </div>
                </div>
               </div>
            ))) : 
              (onlineMembers
              ?.map((member) => (
                <motion.div
                  key={member._id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.userId.profilePicture.url} />
                      <AvatarFallback className="bg-slate-700 text-teal-300">
                        {member.userId.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-300 text-sm">{member.userId.username}</span>
                </motion.div>
              )))}
           
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1 mt-4">
              OFFLINE — {offlineMembers?.length}
            </h4>
            {
              isLoading ? (
                [1,2,3].map((item,i) => (
                  <div className='flex flex-col p-1' key={i}>
                     <div className="flex items-center gap-x-4">
                      <Skeleton className={"h-8 w-8 rounded-full"}/>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-[200px]"/>
                        
                      </div>
                   </div>
                  </div>
               ))
              ) : 
                ( offlineMembers
              ?.map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.userId.profilePicture.url} />
                      <AvatarFallback className="bg-slate-700 text-gray-500">
                        {member.userId.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gray-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-500 text-sm">{member.userId.username}</span>
                </motion.div>
              )))}
              
            
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
}

export default GroupMembers