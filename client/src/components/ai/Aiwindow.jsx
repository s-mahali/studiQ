import React, { useRef, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, SendHorizontal, User, Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/formatTime";
import { fetchExplainCode } from "@/services/api.services";
import { toast } from "react-hot-toast";

const Aiwindow = ({ groupId }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const scrollAreaRef = useRef(null);
  const chatEndRef = useRef(null);

  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm your AI coding assistant. Paste your code here and I'll explain it in simple terms.",
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetchExplainCode({ code: currentInput }, groupId);

      if (response?.data?.success) {
        const aiResponse = {
          id: Date.now() + 1,
          type: "ai",
          content: response?.data?.payload?.aiResponse,
          timestamp: new Date(response?.data.payload?.timestamp),
        };
        setConversation((prev) => [...prev, aiResponse ? aiResponse : {}]);
        toast.success("Code explained successfully");
      } else {
        toast.error(
          response?.data?.error.message || "Failed to Explain your code"
        );
        throw new Error(
          response?.data?.error.message || "No explanation received"
        );
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Sorry, I encountered an error: ${
          error.message || "Something went wrong"
        }`,
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, errorMessage]);
      toast.error("Failed to explain code");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const renderAIResponse = (content) => {
    if (typeof content === "string") {
      return (
        <div className="prose prose-inverse max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
        </div>
      );
    }

    if (Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content?.map((item, index) => (
            <div key={index} className="border-l-2 border-teal-500 pl-4">
              <h4 className="font-semibold text-teal-300 mb-2 font-mono">{item.title}</h4>
              <div className="text-slate-300 text-md leading-relaxed font-sans">
                {item.explaination}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-slate-300 text-sm">
        {JSON.stringify(content, null, 2)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* <div className="p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-teal-400 mr-2" />
          <h2 className="text-lg font-semibold text-white">AI Code Assistant</h2>
        </div>
      </div> */}

      <ScrollArea className="p-4 flex-1 overflow-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversation?.map((message) => (
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
                    <User  size={16} />
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-medium text-sm ${
                      message.type === "ai"
                        ? "text-teal-300"
                        : "text-purple-300"
                    }`}
                  >
                    {message.type === "ai" ? "AI Assistant" : "You"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <div
                  className={`mt-1 p-3 rounded-lg max-w-none relative group ${
                    message.type === "ai"
                      ? "bg-slate-800 text-slate-200"
                      : "bg-purple-900/30 text-slate-300"
                  }`}
                >
                  {message.type === "user" ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {message.content}
                    </pre>
                  ) : (
                    renderAIResponse(message.content)
                  )}

                  <Button
                    onClick={() =>
                      copyToClipboard(
                        typeof message.content === "string"
                          ? message.content
                          : JSON.stringify(message.content, null, 2),
                        message.id
                      )
                    }
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedId === message.id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

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
                  <span className="text-xs text-slate-500">
                    analyzing your code...
                  </span>
                </div>
                <div className="mt-1 p-3 rounded-lg bg-slate-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-slate-800 border-t mb-12 lg:mb-0">
        <form onSubmit={(e) => handleSend(e)} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter or paste your code here..."
            className={"border-transparent z-50"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-to-r from-teal-300 to-teal-500 hover:bg-teal-700 cursor-pointer self-end"
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
