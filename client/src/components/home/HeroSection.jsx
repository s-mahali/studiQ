// - *Hero Section:*
//   - Engaging background image or video of students studying together
//   - Headline: "Connect, Collaborate, and Conquer Your Studies"
//   - Subheadline: "Join a community of learners and achieve your academic goals."
//   - Primary CTA button: "Start Your Free Trial"
//   - Secondary CTA button: "Learn More"

import React from "react";
import heroImg from "../../assets/darkbg2.jpg";
import { Button } from "../ui/button";
import { University } from "lucide-react";
import student from "../../assets/student.svg";

const heroSection = () => {
  return (
    <div className="relative">
      <div className="absolute-inset-0 bg-black/50 z-10">
        {/* background image */}
        <div className="absolute inset-0 z-0 opacity-60">
          <img
            src={heroImg}
            alt="student studying together"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Hero content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 flex flex-col items-center">
          <div className="text-center space-y-8">
            {/* headline */}
            <h1 className="text-4xl md:text-5xl lg:txt-6xl font-bold text-white tracking-tight">
              Connect, Collaborate, and
              <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                Conquer Your Studies
              </span>
            </h1>
            {/* subheadline */}
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
              Join a community of learners and achieve your academic goals.
            </p>
            {/* call to action butoons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                size="lg"
                className={
                  "bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl cursor-pointer"
                }
              >
                Get Started
              </Button>

              <Button
                variant={"outline"}
                className="bg-transparent border-2 border-slate-400 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-xl cursor-pointer"
              >
                Learn More
              </Button>
            </div>
            {/* optional: social proof */}
            <div className="mt-12 z-20 flex flex-col items-center">
              <p className="text-slate-100 mb-4">Trusted by students from</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-70">
                <University size={16} />
                <University size={16} />
                <University size={16} />
                <University size={16} />
              </div>
            </div>
          </div>
        </div>
        {/* wavy graphic element */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg xmlns={student} viewBox="0 0 1440 100" className="w-full">
            <path
              fill="#0F172A"
              fillOpacity={1}
              d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default heroSection;
