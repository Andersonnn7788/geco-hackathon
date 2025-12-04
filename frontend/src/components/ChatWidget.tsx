"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithAgent, ChatMessage, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

    // Add user message immediately
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
      // Remove the optimistic user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError("");
  };

  // Welcome message suggestions
  const suggestions = [
    "Show me available meeting rooms",
    "I need a hot desk for tomorrow",
    "What spaces are available in KL Eco City?",
    "Help me book a private office for 4 people",
  ];

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-light)] transition-all z-50 flex items-center justify-center"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white border border-[var(--border)] rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
            <div>
              <h3 className="font-semibold text-sm">Booking Assistant</h3>
              <p className="text-xs text-[var(--muted)]">
                {isAuthenticated ? "Ready to help you book" : "Sign in to book spaces"}
              </p>
            </div>
            <button
              onClick={handleClearChat}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-[var(--muted)] mb-4">
                  Hi! I can help you find and book workspaces at Infinity8.
                </p>
                <p className="text-xs text-[var(--muted)] mb-3">Try asking:</p>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(suggestion)}
                      className="block w-full text-left text-xs px-3 py-2 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.role === "user"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background)] text-[var(--foreground)]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{formatMessage(message.content)}</div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--background)] px-4 py-3 rounded-lg">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about spaces or bookings..."
                className="flex-1 input text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn btn-primary px-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// Helper function to format message content (handle markdown-like formatting)
function formatMessage(content: string): string {
  // Basic formatting - keep it simple for the chat
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers but keep text
    .trim();
}

