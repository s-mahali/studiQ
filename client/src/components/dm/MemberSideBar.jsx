import { useEffect, useState } from "react";
import Dm from "./Dm";
import { UserCheckIcon, MessageCircle, Users, Circle, X, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";

const MemberSideBar = () => {
  const [friends, setFriends] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  console.log("dmuser", user)
  const {onlineUsers} = useSelector((store) => store.chat);
  console.log("onlineUsers", onlineUsers)

  // Set friends from user friend list
  useEffect(() => {
    setFriends(user?.friends || []);
  }, [user, user.friends]);
  console.log("frienddd",friends)
  console.log("user", user);

  
  //Handle friend selection
  const handleFriendSelection = (userId) => {
    setReceiverId(userId);
    setIsSidebarOpen(false); // close sidebar on mobile after selection
  }

  //close sidebar when clicking outside on mobile 
  const handleBackdropClick = (e) => {
    if(e.target === e.currentTarget) {
      setIsSidebarOpen(false);
    }
  }

  console.log("receiverId", receiverId);

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 px-2"
        size="sm"
      >
        {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
      </Button>
      {/* Mobile Backdrop */}
       {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleBackdropClick}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 md:z-0
        w-80 md:w-80 sm:w-72 
        bg-slate-900 border-r border-slate-700 
        flex flex-col min-h-full 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <UserCheckIcon size={20} className="text-teal-400" />
            <h2 className="text-lg font-semibold text-white">Friends</h2>
          </div>
          {/* close button for mobiles */}
          <Button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-slate-800"
              variant="ghost"
              size="sm"
            >
              <X size={16} />
            </Button>
          
          <div className="flex items-center gap-2 text-slate-400">
            <MessageCircle size={16} />
            <h3 className="text-sm font-medium">Direct Messages</h3>
          </div>
        </div>

        {/* Friends List */}
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {friends && friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend?.user?._id}
                  onClick={() => handleFriendSelection(friend?.user?._id) }
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                    hover:bg-slate-800/60 group
                    ${receiverId === friend?.user?._id 
                      ? 'bg-slate-800 border-l-2 border-teal-500' 
                      : 'hover:bg-slate-800/40'
                    }
                  `}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.user?.profilePicture?.url} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-medium">
                        {friend.user?.username?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Online status indicator */}
                    <div className="absolute -bottom-1 -right-1">
                      <div className={`
                        w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center
                        ${onlineUsers.includes(friend?.user?._id) ? 'bg-green-500' : 'bg-slate-500'}
                      `}>
                        <Circle size={8} className="fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`
                        font-medium text-sm truncate
                        ${receiverId === friend?.user?._id ? 'text-white' : 'text-slate-300'}
                        group-hover:text-white transition-colors
                      `}>
                        {friend.user?.username || "Unknown User"}
                      </h4>
                    </div>
                    
                    <p className={`
                      text-xs truncate mt-0.5
                      ${receiverId === friend?.user?._id  ? 'text-green-400' : 'text-slate-500'}
                    `}>
                      {onlineUsers.includes(friend?.user?._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  {/* Message indicator (optional) */}
                  {receiverId === friend?.user?._id && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-slate-500" />
                </div>
                <h3 className="text-slate-300 font-medium mb-2">No friends yet</h3>
                <p className="text-slate-500 text-sm text-center">
                  Start connecting with people to see them here
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer (optional) */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs">
              {friends.filter(f => onlineUsers.includes(f.user?._id)).length} online
            </span>
          </div>
        </div>
      </div>

      {/* DM Component */}
      <div className="flex-1 md:flex-1 w-full md:w-auto ">
        {receiverId ? (
          <Dm receiverId={receiverId} onBack={isSidebarOpen} />
        ) : (
          <div className="flex items-center justify-center  bg-slate-900 h-full p-4">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MessageCircle size={40} className="text-slate-500" />
              </div>
              <h3 className="text-slate-300 font-medium mb-2">Select a friend to start messaging</h3>
              <p className="text-slate-500 text-sm">
                Choose someone from your friends list to begin a conversation
              </p>
              <Button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden mt-4 bg-teal-600 hover:bg-teal-700"
              >
                View Friends
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSideBar;