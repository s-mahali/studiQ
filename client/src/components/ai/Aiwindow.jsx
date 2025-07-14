import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, SendHorizontal, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/formatTime";

const Aiwindow = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Static conversation data
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: "user",
      content: "Can you explain what a React component is?",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: "ai",
      content: "A React component is a reusable piece of code that returns JSX elements to be rendered to the screen. Think of it as a building block for your user interface. Components can be function-based or class-based, and they can accept props (properties) to make them dynamic and reusable.",
      timestamp: new Date(),
    },
    {
      id: 3,
      type: "user",
      content: "How do I create a simple component?",
      timestamp: new Date(),
    },
    {
      id: 4,
      type: "ai",
      content: `Here's a simple example:

\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="Alice" />
\`\`\`

This component:
- Takes a \`name\` prop
- Returns JSX that displays a greeting
- Can be reused with different names`,
      timestamp: new Date(),
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content: `I understand you're asking about: "${input}". This is a simulated AI response. In a real implementation, this would be connected to your Gemini API to provide actual AI-generated responses.`,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-teal-400 mr-2" />
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                {message.type === "ai" ? (
                  <AvatarFallback className="bg-teal-700 text-white">
                    <Bot size={16} />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-purple-700 text-white">
                    <User size={16} />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={`font-medium text-sm ${
                    message.type === "ai" ? "text-teal-300" : "text-purple-300"
                  }`}>
                    {message.type === "ai" ? "AI Assistant" : "You"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`mt-1 p-3 rounded-lg max-w-none ${
                  message.type === "ai" 
                    ? "bg-slate-800 text-slate-200" 
                    : "bg-purple-900/30 text-slate-300"
                }`}>
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {message.content}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-teal-700 text-white">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm text-teal-300">
                    AI Assistant
                  </span>
                  <span className="text-xs text-slate-500">typing...</span>
                </div>
                <div className="mt-1 p-3 rounded-lg bg-slate-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-slate-800 border-t    relative">
        <form onSubmit={handleSend} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter or paste your code here..."
            className={"border-transparent z-50"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-to-r from-teal-300 to-teal-500 hover:bg-teal-700 absolute right-6 top-7"
            disabled={!input.trim() || isLoading}
          >
            <SendHorizontal size={12} />
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default Aiwindow;