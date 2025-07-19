// - *Middle Slide Box:*
//   - Carousel of user profiles showcasing active users with:
//     - Profile picture
//     - Name/nickname
//     - Skills and subjects interesets of the user
//     - "Connect" button to initiate a study group

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  UserPlus,
  ChevronRight,
  UserPen,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
// import {student1, student2, student3} from "../../assets"
import student1 from "../../assets/student1.jpg";
import {
  fetchSuggestedPeers,
  sendConnectionToPeers,
} from "@/services/api.services";
import { setPeers } from "@/redux/slicers/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

//TODO: static data need to change later
const users = [
  {
    id: 1,
    name: "Alex Morgan",
    nickname: "alex_m",
    profileImage: "/api/placeholder/150/150",
    skills: ["Problem-solving", "Research", "Time Management"],
    subjects: ["Mathematics", "Physics"],
    proficiency: "advanced",
  },
  {
    id: 2,
    name: "Jamie Chen",
    nickname: "j_chen",
    profileImage: "/api/placeholder/150/150",
    skills: ["Critical Thinking", "Note-taking"],
    subjects: ["Biology", "Chemistry", "Psychology"],
    proficiency: "intermediate",
  },
  {
    id: 3,
    name: "Taylor Smith",
    nickname: "t_smith",
    profileImage: "/api/placeholder/150/150",
    skills: ["Group Study", "Memorization"],
    subjects: ["Computer Science", "Philosophy"],
    proficiency: "beginner",
  },
  {
    id: 4,
    name: "Jordan Patel",
    nickname: "jo_patel",
    profileImage: "/api/placeholder/150/150",
    skills: ["Essay Writing", "Presentation"],
    subjects: ["Literature", "History", "Sociology"],
    proficiency: "advanced",
  },
  {
    id: 5,
    name: "Riley Johnson",
    nickname: "rj_study",
    profileImage: "/api/placeholder/150/150",
    skills: ["Data Analysis", "Project Management"],
    subjects: ["Economics", "Statistics"],
    proficiency: "intermediate",
  },
];

const getProficiencyColor = (proficiency) => {
  switch (proficiency) {
    case "beginner":
      return "bg-blue-500";
    case "intermediate":
      return "bg-purple-500";
    case "advanced":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
};

const FindPeers = ({ className }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState({});
  const [sentRequestIds, setSentRequestIds] = useState([]);
  const [peersData, setPeersData] = useState([]);
  const caraouselRef = useRef(null);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const dispatch = useDispatch();

  //api fetching suggestedUsers
  useEffect(() => {
    const fethSuggestedUsersList = async () => {
      setLoading(true);
      try {
        const response = await fetchSuggestedPeers();
        if (response?.status === 200) {
          setPeersData(response?.data.peerlist);
          if (response?.data.pendingRequests.length > 0) {
            setSentRequestIds(response?.data.pendingRequests);
          }
          dispatch(setPeers(response?.data.peerlist));
        }
      } catch (error) {
        console.error("error fetching perrlist", error.message);
      } finally {
        setLoading(false);
      }
    };
    fethSuggestedUsersList();
  }, []);

  // send connectionRequest
  const sendConnectionRequest = async (receiverId) => {
    setLoadingRequests((prev) => ({ ...prev, [receiverId]: true }));
    try {
      const response = await sendConnectionToPeers({ receiverId });
      if (response?.status === 200) {
        setSentRequestIds((prev) => [...prev, receiverId]);
        toast.success(response.data.message || "Request Sent Successfully");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || "something went wrong");
    } finally {
      setLoadingRequests((prev) => ({ ...prev, [receiverId]: false }));
    }
  };

  //Responsive adjustment for number of cards shown
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const totalPages = Math.ceil(users.length / cardsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  //auto play
  useEffect(() => {
    const interval = setInterval(() => {
      nextPage();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const visibleUsers = () => {
    const start = (currentPage * cardsPerPage) % peersData.length;
    const end = start + cardsPerPage;
    if (end <= peersData.length) {
      return peersData.slice(start, end);
    } else {
      //handle wrap-around
      return [
        ...peersData.slice(start),
        ...peersData.slice(0, end - peersData.length),
      ];
    }
  };

  return (
    <div className={"pt-16  px-4 bg-slate-900 " + className || ""}>
      {loading ? (
        <div className="flex min-h-screen justify-center items-center">
          <Loader2 className="animate-spin  w-16 h-16 text-teal-400" />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          {/* section Header */}
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-white mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Connect with Learners
            </motion.h2>
            <motion.p
              className="text-lg text-slate-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find and connect with students who share your interests and
              academic goals.
            </motion.p>
          </div>
          <div className="relative" ref={caraouselRef}>
            {/* navigation buttons */}
            <div className="absolute top-1/2 -left-4 sm:left-6 -translate-y-1/2 z-10">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevPage}
                  className="rounded-full bg-slate-800/80 hover:bg-slate-700 text-white h-12 w-12 shadow-lg shadow-cyan-900/20"
                >
                  <ChevronLeft size={24} />
                </Button>
              </motion.div>
            </div>

            <div className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 z-10">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextPage}
                  className="rounded-full bg-slate-800/80 hover:bg-slate-700 text-white h-12 w-12 shadow-lg shadow-cyan-900/20"
                >
                  <ChevronRight size={24} />
                </Button>
              </motion.div>
            </div>

            {/* User cards */}
            <div className="overflow-hidden px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  className="flex gap-4 md:gap-6"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  {visibleUsers().map((user) => (
                    <motion.div
                      key={user._id.toString()}
                      className="flex-1 min-w-0"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="h-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-900/20 hover:shadow-xl transition-all">
                        {/* Card Header with Gradient */}
                        <div className="h-12 bg-gradient-to-r from-purple-600/20 via-10% to-cyan-500/20 border-b border-slate-700/50"></div>

                        <div className="p-6 flex flex-col items-center">
                          {/* Profile image with status indicator */}
                          <div className="relative mb-4 -mt-10">
                            <Avatar className="h-24 w-24 border-4 border-slate-800 shadow-lg">
                              <AvatarImage
                                src={user?.profilePicture?.url || ""}
                                alt={user.username}
                                className="object-cover aspect-square"
                              />
                              <AvatarFallback className="text-lg font-medium">
                                {user.username.charAt(0)}
                                {user.username.split(" ")[1]?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-slate-800 ${getProficiencyColor(
                                user?.subjects[0]?.proficiency || "beginners"
                              )}`}
                            ></span>
                          </div>

                          {/* user info */}
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {user.username}
                          </h3>
                          <p className="mb-4 text-slate-400">
                            @{user.nickname || "nickname"}
                          </p>

                          {/* Proficiency level */}
                          <div className="mb-4">
                            <Badge
                              variant="outline"
                              className={`${
                                user.subjects[0]?.proficiency === "advanced"
                                  ? "text-teal-300"
                                  : user.subjects[0]?.proficiency ===
                                    "intermediate"
                                  ? "text-purple-300"
                                  : "text-blue-300"
                              }`}
                            >
                              {user.subjects[0]?.proficiency
                                .charAt(0)
                                .toUpperCase() +
                                user.subjects[0]?.proficiency.slice(1) || "NA"}
                            </Badge>
                          </div>
                          {/* subjects  */}
                          <div className="mb-3 w-full">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Subjects
                            </h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {user.subjects.map((subject, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-slate-700/50 hover:bg-slate-700 text-purple-300 border-purple-700/30"
                                >
                                  {subject.name || "NA"}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* skills */}
                          <div className="mb-5 w-full">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Skills
                            </h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {user.skills.map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  className={
                                    "bg-slate-700/50 hover:bg-slate-700 text-blue-300 border-blue-700/30"
                                  }
                                >
                                  {skill.name || "NA"}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* call to action buttons */}
                          {/* Connect button with animation */}
                          <div className="w-full flex gap-2">
                            <motion.div
                              className="w-1/2"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button
                                className={`w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 transition-all shadow-md hover:shadow-lg hover:shadow-cyan-900/30 cursor-pointer ${
                                  sentRequestIds.includes(user._id) &&
                                  "bg-slate-600/60 hover:bg-slate-600/50 cursor-not-allowed"
                                }`}
                                disabled={sentRequestIds.includes(user._id)}
                                onClick={() => sendConnectionRequest(user._id)}
                              >
                                {loadingRequests[user._id] ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <UserPlus size={18} className="mr-2" />
                                )}
                                {sentRequestIds.includes(user._id)
                                  ? "Request Sent"
                                  : "Connect"}
                              </Button>
                            </motion.div>
                            <motion.div
                              className="w-1/2"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Link
                                className="w-full block"
                                to={`/profile/${user._id.toString()}`}
                              >
                                <Button
                                  className="w-full border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white cursor-pointer"
                                  variant="outline"
                                >
                                  <UserPen size={18} className="mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* pagination dots */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentPage === i ? "w-6 bg-cyan-500" : "w-2 bg-slate-600"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPeers;
