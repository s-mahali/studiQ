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
import { Link } from "react-router-dom";

const heroSection = () => {
  return (
   <section className="relative min-h-screen flex items-center justify-center pt-24">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Students studying together"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Connect, Collaborate, and
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
              Conquer Your Studies
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
            Join a community of learners and achieve your academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl cursor-pointer"
              >
                Get Started
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-transparent border-2 border-slate-400 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-xl cursor-pointer"
            >
              Learn More
            </Button>
          </div>
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

      {/* Wavy graphic element */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 100" className="w-full">
          <path
            fill="#0F172A"
            fillOpacity={1}
            d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default heroSection;
