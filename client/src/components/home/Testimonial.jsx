import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const TestimonialSection = () => {
  const testimonials = [
    {
      quote: "This study platform completely transformed how I prepare for exams. The ability to connect with peers in my field made difficult concepts much easier to grasp.",
      name: "Sarah Johnson",
      role: "Computer Science Major",
      avatar: "/api/placeholder/100/100" 
    },
    {
      quote: "The group study feature helped me find students in my advanced calculus class. We've been meeting regularly, and my grades have improved significantly.",
      name: "Michael Chen",
      role: "Mathematics Student",
      avatar: "/api/placeholder/100/100"
    },
    {
      quote: "As a remote student, I struggled to connect with classmates. This platform bridged that gap and now I have a support network I can rely on.",
      name: "Priya Patel",
      role: "Psychology Major",
      avatar: "/api/placeholder/100/100"
    },
    {
      quote: "Resource sharing made collecting study materials so much easier. Everyone contributes what they know, and we all benefit from the collective knowledge.",
      name: "James Wilson",
      role: "Business Administration",
      avatar: "/api/placeholder/100/100"
    }
  ];

  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const next = () => {
    setAutoplay(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setAutoplay(false);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the benefits
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation arrows */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 md:-translate-x-16">
            <button 
              onClick={prev} 
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-teal-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 md:translate-x-16">
            <button 
              onClick={next} 
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-teal-700 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Testimonial Cards */}
          <div className="overflow-hidden relative">
            <div className="flex items-center justify-center">
              <Card className="bg-gradient-to-br from-slate-600 via-5% to-blue-500 border border-gray-700 w-full hover:border-teal-500">
                <CardContent className="p-4 ">
                  <Quote className="text-teal-400 w-8 h-8 mb-6" />
                  
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-lg md:text-xl text-gray-200 italic mb-8">
                      "{testimonials[current].quote}"
                    </p>
                    
                    <div className="flex flex-col items-center">
                      <Avatar className="w-16 h-16 border-2 border-teal-500 mb-4">
                        <AvatarImage src={testimonials[current].avatar} alt={testimonials[current].name} />
                        <AvatarFallback className="bg-teal-800 text-white">
                          {testimonials[current].name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="text-white font-medium text-lg">{testimonials[current].name}</h4>
                      <p className="text-teal-400">{testimonials[current].role}</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoplay(false);
                  setCurrent(index);
                }}
                className={`w-3 h-3 rounded-full ${
                  index === current ? 'bg-teal-500' : 'bg-gray-600'
                } transition-colors`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;