// editprofile picture component will be separeted and endpoint is also separeted for editprofile.

import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  Loader,
  Loader2,
  PlusCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import {setAuthUser} from "@/redux/slicers/authSlice"
import { editProfileData } from "@/services/api.services";
import {motion} from "framer-motion"






const educationLevelOptions = [
  "high school",
  "college",
  "graduate",
  "professional",
  "other",
];

const proficiencyOptions = ["beginner", "intermediate", "advanced"];

const EditProfile = () => {
  const initialState = {
    subjects: [
      {
        name: "",
        proficiency: "beginner",
      },
    ],
    nickname: "",
    educationLevel: "",
    skills: [
      {
        name: "",
      },
    ],
  };

  const [input, setInput] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  
  console.log("user", user)

  //Set initial values
  useEffect(() => {
    if (user) {
      setInput({
        nickname: user.nickname || "",
        educationLevel: user.educationLevel || "",
        subjects:
          user.subjects && user.subjects.length > 0
            ? user.subjects
            : [{ name: "", proficiency: "beginner" }],
        skills:
          user.skills && user.skills.length > 0
            ? user.skills
            : [{ name: "" }],
      });
    }
  }, [user]);

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  //Handle changes to subject fields
  const handleSubjectChange = (index, field, value) => {
    const updateSubjects = [...input.subjects];
    updateSubjects[index][field] = value;
    setInput({
      ...input,
      subjects: updateSubjects,
    });
  };

  //Add a new subject
  const addSubject = () => {
    setInput({
      ...input,
      subjects: [...input.subjects, { name: "", proficiency: "beginner" }],
    });
  };

  //Remove a subject
  const removeSubjects = (index) => {
    if (input.subjects.length > 1) {
      const updatedSubjects = input.subjects.filter((_, i) => i !== index);
      setInput({
        ...input,
        subjects: updatedSubjects,
      });
    } else {
      toast.error("Please add at least one subject");
    }
  };

  //Handle change to skill fields
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...input.skills];
    updatedSkills[index].name = value;
    setInput({
      ...input,
      skills: updatedSkills,
    });
  };

  // Add a new skill
  const addSkill = () => {
    setInput({
      ...input,
      skills: [...input.skills, { name: "" }],
    });
  };

  //Remove a skill
  const removeSkill = (index) => {
    if (input.skills.length > 1) {
      const updatedSkills = input.skills.filter((_, i) => i !== index);
      setInput({
        ...input,
        skills: updatedSkills,
      });
    } else {
      toast.error("Please add at least one skill");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const hasEmptySubject = input.subjects.some(
      (subject) => !subject.name.trim()
    );
    if (hasEmptySubject) {
      toast.error("Please add at least one subject");
      return;
    }

    const hasEmptySkill = input.skills.some((skill) => !skill.name.trim());
    if (hasEmptySkill) {
      toast.error("Please add at least one skill");
      return;
    }

    setIsLoading(true);
    try {
      const res = await editProfileData(input);
      console.log(res);
      if (res.data.success) {
        toast.success(res.data.message);
        
        navigate(`/profile/${user._id}`);
        dispatch(setAuthUser(res.data.user));
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-6 text-white">
      <motion.div
       initial={{opacity: 0, scale: 0.95}}
       animate={{opacity: 1, scale: 1}}
       transition={{duration: 0.3}}
       
      >
       <div className="max-w-3xl mx-auto bg-gray-800/60 rounded-lg shadow-lg">
        <div className="border-b border-gray-700 p-4 md:p-6 flex items-center justify-between">
          <div flex items-center gap-2>
            <button
              onClick={() => navigate(`/profile/${user._id}`)}
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Edit Profile</h2>
          </div>
          <motion.button
           initial={{opacity:0, y:20}}
           animate={{opacity:1, y:0}}
           transistion={{delay: 0.5}}
           whileHover={{scale: 1.02}}
           whileTap={{scale: 0.98}}
            onClick={submitHandler}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save size={18} />
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Save"
            )}
          </motion.button>
        </div>

        <form onSubmit={submitHandler} className="p-4 md:p-6 space-y-6">
          {/* Nickname */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={input.nickname}
              onChange={changeEventHandler}
              placeholder="Enter your nickname"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          {/* education Level */}
          <div>
            <label
              htmlFor="educationLevel"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Education Level
            </label>
            <div className="relative">
              <select
                id="educationLevel"
                name="educationLevel"
                value={input.educationLevel}
                onChange={changeEventHandler}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select Your Education Level
                </option>
                {educationLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          {/* subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-400">
                Subjects
              </label>
              <button
                type="button"
                onClick={addSubject}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm transition-colors"
              >
                <PlusCircle size={16} />
                Add Subject
              </button>
            </div>
            <div className="space-y-3">
              {input.subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) =>
                        handleSubjectChange(index, "name", e.target.value)
                      }
                      placeholder="Subject Name"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="w-1/3">
                    <div className="relative">
                      <select
                        value={subject.proficiency}
                        onChange={(e) =>
                          handleSubjectChange(
                            index,
                            "proficiency",
                            e.target.value
                          )
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                      >
                        {proficiencyOptions.map((level, i) => (
                          <option key={i} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubjects(index)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-400">
                Skills
              </label>
              <button
                type="button"
                onClick={addSkill}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm transition-colors"
              >
                <PlusCircle size={16} />
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {input.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-700 rounded-full pl-3 pr-1 py-1"
                >
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Add a skill"
                    className="bg-transparent border-none focus:outline-none text-sm w-full max-w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-1 p-1 text-gray-400 hover:text-red-400 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;
