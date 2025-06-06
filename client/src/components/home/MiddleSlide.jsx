// - *Middle Slide Box:*
//   - Carousel of user profiles showcasing active users with:
//     - Profile picture
//     - Name/nickname
//     - Skills and subjects interesets of the user
//     - "Connect" button to initiate a study group

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
// import {student1, student2, student3} from "../../assets"
 import student1 from "../../assets/student1.jpg"
import axios from "axios";

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

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

//api call for send friend request
// const sendFriendRequest  = async () => {
//      const res = api.post
// }


const MiddleSlide = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const caraouselRef = useRef(null);
  const [cardsPerPage, setCardsPerPage] = useState(3);

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
    const start = (currentPage * cardsPerPage) % users.length;
    const end = start + cardsPerPage;
    if (end <= users.length) {
      return users.slice(start, end);
    } else {
      //handle wrap-around
      return [...users.slice(start), ...users.slice(0, end - users.length)];
    }
  };

  return (
    <div className="py-16 px-4 bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Connect with Learners
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Find and connect with students who share your interests and academic
            goals.
          </p>
        </div>

        <div className="relative" ref={caraouselRef}>
          {/* navigation buttons */}
          <div className="absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPage}
              className={
                "rounded-full bg-slate-800/80 hover:bg-slate-700 text-white h-12 w-12"
              }
            >
              <ChevronLeft size={24} />
            </Button>
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
                  <div
                    key={user.id}
                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-cyan-900/20 hover:shadow-xl"
                  >
                    <div className="p-6 flex flex-col items-center">
                      {/* profile image with status indicator */}
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24 mb-2">
                          <AvatarImage
                            src={student1}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name.charAt(0)}
                            {user.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-2 right-0 w-5 h-5 rounded-full border-4 border-slate-800 ${getProficiencyColor(
                            user.proficiency
                          )}`}
                        ></span>
                      </div>

                      {/* user info */}
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {user.name}
                      </h3>
                      <p className="mb-4 text-slate-400">@{user.nickname}</p>

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
                              {subject}
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
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* call to action buttons */}
                      <Button
                        className={
                          "w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
                        }
                      >
                        <UserPlus size={18} className="mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
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
    </div>
  );
};

export default MiddleSlide;
