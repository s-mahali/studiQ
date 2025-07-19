// - *Features Section:*
//   - Icons and short descriptions of key features (e.g., Group Study, Chat, Resource Sharing, Scheduling)
import React from "react";
import {
  BookOpen,
  Users,
  MessageCircle,
  Calendar,
  Compass,
  Share2,
  Brain,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Users className="w-10 h-10 text-teal-400 mb-4" />,
      title: "Group Study",
      description:
        "Form study groups with peers who share your academic interests and goals",
    },
    {
      icon: <MessageCircle className="w-10 h-10 text-teal-400 mb-4" />,
      title: "Chat",
      description:
        "Real-time messaging to discuss assignments and share knowledge",
    },
    {
      icon: <Share2 className="w-10 h-10 text-teal-400 mb-4" />,
      title: "Resource Sharing",
      description: "Exchange study materials, notes, and helpful resources",
    },
    {
      icon: <Brain className="w-10 h-10 text-teal-400 mb-4" />,
      title: "AI Coding Assistance",
      description:
        "Solve and understand programming assignments with AI coding assistance",
    },
    {
      icon: <Compass className="w-10 h-10 text-teal-400 mb-4" />,
      title: "Skill Matching",
      description:
        "Connect with students who have complementary skills and subjects",
    },
    {
      icon: <BookOpen className="w-10 h-10 text-teal-400 mb-4" />,
      title: "Learning Paths",
      description:
        "Follow structured learning journeys tailored to your academic goals",
    },
  ];
  return (
    <section className="w-full py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Features</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to connect, collaborate, and succeed in your
            academic journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-8 rounded-lg transition-all duration-300 hover:bg-gray-700
                 border border-gray-700 hover:border-teal-500
                 "
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
