import { useState } from 'react';
import { 
  User, 
  Settings, 
  Calendar, 
  Clock, 
  Award, 
  ChevronDown, 
  BookOpen, 
  Layers, 
  Users, 
  UserPlus, 
  Send, 
  Check, 
  BarChart3
} from 'lucide-react';

export default function StudyProfilePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const profileData = {
    name: "Emily Parker",
    username: "em_parker",
    verified: true,
    profilePicture: "/api/placeholder/200/200",
    educationLevel: "Computer Science - Junior Year",
    subjects: ["Algorithms", "Database Systems", "Web Development", "Software Engineering"],
    skills: ["Problem-solving", "Time Management", "Critical Thinking", "Group Collaboration"],
    activity: {
      lastLogin: "Today at 2:30 PM",
      totalStudyTime: "126 hours",
      progress: 78
    },
    isActive: true,
    friends: [
      { id: 1, name: "Alex Johnson", picture: "/api/placeholder/40/40" },
      { id: 2, name: "Maya Chen", picture: "/api/placeholder/40/40" },
      { id: 3, name: "David Kim", picture: "/api/placeholder/40/40" },
      { id: 4, name: "Sarah Miller", picture: "/api/placeholder/40/40" },
      { id: 5, name: "+12 more", picture: null }
    ],
    friendRequests: [
      { id: 101, name: "James Wilson", picture: "/api/placeholder/40/40" },
      { id: 102, name: "Priya Sharma", picture: "/api/placeholder/40/40" }
    ],
    sentRequests: [
      { id: 201, name: "Michael Brown", picture: "/api/placeholder/40/40" }
    ],
    groups: [
      { id: 1, name: "Algorithm Masters" },
      { id: 2, name: "Database Design Club" },
      { id: 3, name: "Web Dev Enthusiasts" }
    ],
    
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gradient-to-b from-teal-900/30 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* Left column: Profile info */}
            <div className="lg:w-9/12">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <div className="relative">
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-teal-500"
                  />
                  {profileData.isActive && (
                    <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{profileData.name}</h1>
                    {profileData.verified && (
                      <span className="bg-teal-500 p-1 rounded-full">
                        <Check size={16} className="text-gray-900" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-400 mb-4">
                    <span>@{profileData.username}</span>
                    <span className="mx-2">•</span>
                    <span>{profileData.educationLevel}</span>
                  </div>
                  
                  <button className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors text-sm font-medium">
                    Edit Profile
                  </button>
                </div>
              </div>
              
              {/* Stats Grid */}
             
              
              {/* Activity and Progress */}
              <div className="bg-gray-800/60 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 size={20} />
                    Study Activity
                  </h2>
                  <div className="text-sm text-gray-400">
                    <span className="text-teal-400 font-medium">Last login:</span> {profileData.activity.lastLogin}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-teal-400 font-medium">{profileData.activity.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full mb-6">
                      <div 
                        className="h-2 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full" 
                        style={{width: `${profileData.activity.progress}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-gray-400">Total Study Time</div>
                        <div className="text-lg font-semibold">{profileData.activity.totalStudyTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400">Weekly Goal</div>
                        <div className="text-lg font-semibold">160 hours</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {/* Placeholder for study activity chart */}
                    <div className="h-24 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Study Activity Graph</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subjects and Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-800/60 rounded-lg p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <BookOpen size={20} />
                    Subjects
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.subjects.map((subject, index) => (
                      <span key={index} className="bg-gray-700 text-teal-300 px-3 py-1 rounded-full text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800/60 rounded-lg p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Award size={20} />
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-700 text-teal-300 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Study Groups */}
              <div className="bg-gray-800/60 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Layers size={20} />
                  Study Groups
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.groups.map(group => (
                    <div key={group.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                      <span>{group.name}</span>
                      <button className="text-teal-400 hover:text-teal-300 transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right column: Friends, requests, settings */}
            <div className="lg:w-3/12">
              <div className="relative mb-6">
                <button 
                  className="bg-gray-800/60 w-full p-4 rounded-lg flex items-center justify-between"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-10 py-2">
                    <a href="#" className="block px-4 py-2 hover:bg-gray-700">Profile Settings</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-700">Privacy</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-700">Notifications</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-700">Study Preferences</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-700">Logout</a>
                  </div>
                )}
              </div>
              
              {/* Friends List */}
              <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Users size={18} />
                  Friends ({profileData.friends.length - 1})
                </h3>
                
                <div className="space-y-3">
                  {profileData.friends.slice(0, 4).map(friend => (
                    <div key={friend.id} className="flex items-center gap-3">
                      {friend.picture ? (
                        <img src={friend.picture} alt={friend.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                          +
                        </div>
                      )}
                      <span className="text-sm">{friend.name}</span>
                    </div>
                  ))}
                </div>
                
                {profileData.friends.length > 4 && (
                  <button className="w-full mt-3 text-sm text-teal-400 hover:text-teal-300 transition-colors">
                    View All Friends
                  </button>
                )}
              </div>
              
              {/* Friend Requests */}
              <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <UserPlus size={18} />
                  Friend Requests ({profileData.friendRequests.length})
                </h3>
                
                <div className="space-y-4">
                  {profileData.friendRequests.map(request => (
                    <div key={request.id} className="flex items-center gap-3">
                      <img src={request.picture} alt={request.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm flex-1">{request.name}</span>
                      <div className="flex gap-1">
                        <button className="p-1 bg-teal-600 hover:bg-teal-700 rounded text-xs">
                          Accept
                        </button>
                        <button className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sent Requests */}
              <div className="bg-gray-800/60 rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Send size={18} />
                  Sent Requests ({profileData.sentRequests.length})
                </h3>
                
                <div className="space-y-3">
                  {profileData.sentRequests.map(request => (
                    <div key={request.id} className="flex items-center gap-3">
                      <img src={request.picture} alt={request.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm flex-1">{request.name}</span>
                      <button className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}