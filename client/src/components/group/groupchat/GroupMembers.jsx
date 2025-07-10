import React from 'react'
import {motion} from "framer-motion"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const members = [
    {
      id: 1,
      name: "Alex Smith",
      status: "online",
      isSpeaking: true,
      image: null,
    },
    {
      id: 2,
      name: "Jamie Rodriguez",
      status: "online",
      isSpeaking: false,
      image: null,
    },
    {
      id: 3,
      name: "Taylor Kim",
      status: "idle",
      isSpeaking: false,
      image: null,
    },
    {
      id: 4,
      name: "Jordan Lee",
      status: "offline",
      isSpeaking: false,
      image: null,
    },
    {
      id: 5,
      name: "Casey Johnson",
      status: "online",
      isSpeaking: false,
      image: null,
    },
  ];

const GroupMembers = ({}) => {
  return (
    <>
       {/* Memebers Sidebar */}
      <motion.div
        className="bg-slate-800 border-l border-slate-700 w-60 flex-shrink-0 hidden md:block"
        initial={{ width: 240 }}
        animate={{ width: 240 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Users className="mr-2" size={18} /> Members
          </h3>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2">
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1">
              ONLINE — {members.filter((m) => m.status === "online").length}
            </h4>
            {members
              .filter((m) => m.status === "online")
              .map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-slate-700 text-teal-300">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-300 text-sm">{member.name}</span>
                </motion.div>
              ))}
            <h4 className="text-xs text-slate-400 font-medium ml-2 mb-1 mt-4">
              OFFLINE — {members.filter((m) => m.status === "offline").length}
            </h4>
            {members
              .filter((m) => m.status === "offline")
              .map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-slate-700 text-gray-500">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gray-500 border border-slate-800"></span>
                  </div>
                  <span className="text-slate-500 text-sm">{member.name}</span>
                </motion.div>
              ))}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
}

export default GroupMembers