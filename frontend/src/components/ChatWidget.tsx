"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithAgent, ChatMessage, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MessageCircle, X, Send, Sparkles, Building2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError("");

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await chatWithAgent(userMessage, messages);
      setMessages(response.conversation_history);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to get response. Please try again.");
      }
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError("");
  };

  const suggestions = [
    { text: "Show me available meeting rooms", icon: Building2 },
    { text: "I need a hot desk for tomorrow", icon: Calendar },
    { text: "What spaces are in KL Eco City?", icon: MapPin },
    { text: "Book a private office for 4 people", icon: Users },
  ];

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 ${isOpen ? "hidden" : "block"}`}
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          
          {/* Pulse indicator */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white shadow-sm"></span>
          </span>
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-3rem)] z-50 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Booking Assistant</h3>
                <p className="text-xs text-slate-500">
                  {isAuthenticated ? "Ready to help you book" : "Sign in to book spaces"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-white/50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Hi! I&apos;m your booking assistant</h4>
                  <p className="text-sm text-slate-500">
                    I can help you find and book the perfect workspace
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 text-center mb-3 font-medium">Try asking:</p>
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(suggestion.text)}
                        className="flex items-center gap-3 w-full text-left text-sm px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-slate-600">
                          {suggestion.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-md rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center">
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl inline-block">
                  {error}
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-5 bg-white border-t border-slate-200">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about spaces or bookings..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Powered by AI • Responses may vary
            </p>
          </form>
        </div>
      )}
    </>
  );
}
