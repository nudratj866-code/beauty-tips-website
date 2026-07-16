import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Bot, User as UserIcon, AlertCircle, RefreshCw } from "lucide-react";
import { User } from "../types";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const PRESETS = [
  { label: "✨ Dehydrated Skin Care Guide", prompt: "My skin is feeling dehydrated and dull. Can you create a nourishing morning and night skincare routine for me?" },
  { label: "🌿 Natural Remedy for Acne", prompt: "What are some safe natural home remedies to soothe active acne and reduce inflammation?" },
  { label: "💄 Flawless Base Trick", prompt: "Explain the best makeup application techniques to prevent foundation from looking cakey or drying out." },
  { label: "👰 3-Month Bridal Checklist", prompt: "Can you list the key bridal beauty preparations I should focus on 3 months before my wedding?" }
];

export default function AIAssistant({ isOpen, onClose, user }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello, gorgeous! I am Aura, your personal AI Beauty & Skincare specialist. Whether you want to cure frizz, decode hyaluronic acid, or craft a custom bridal countdown, I'm here to guide you. How can I help you glow today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    setError(null);

    try {
      // Build simple chat history excluding first system welcome
      const chatHistory = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/beauty-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          skinType: user?.skinType || "Normal",
          hairType: user?.hairType || "Straight",
          history: chatHistory
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to communicate with Aura.");
      }

      const assistantMsg: ChatMessage = { role: "model", text: data.text || "I am here to help you." };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        text: "Hello, gorgeous! I am Aura, your personal AI Beauty & Skincare specialist. Whether you want to cure frizz, decode hyaluronic acid, or craft a custom bridal countdown, I'm here to guide you. How can I help you glow today?"
      }
    ]);
    setError(null);
  };

  // Render markdown text dynamically to fit the premium look
  const formatResponse = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold text formatting
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formattedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-semibold text-pink-700 dark:text-pink-400">{part}</strong>;
        }
        return part;
      });

      if (line.startsWith("### ")) {
        return <h4 key={i} className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mt-4 mb-1.5">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={i} className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mt-5 mb-2 border-b border-pink-50 pb-1">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i} className="list-disc pl-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-1">{formattedLine.slice(1)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <p key={i} className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-1.5 pl-2 font-light">{formattedLine}</p>;
      }
      if (!line.trim()) {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-1.5 font-light">{formattedLine}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main drawer body */}
      <div className="relative h-full w-full max-w-md bg-pink-50/10 dark:bg-[#1A0F11] shadow-2xl flex flex-col justify-between overflow-hidden z-10 border-l border-pink-100/30">
        
        {/* Header bar */}
        <div className="flex h-16 items-center justify-between border-b border-pink-100/30 bg-white/90 dark:bg-[#25181A]/90 backdrop-blur-md px-4 dark:border-rose-950/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-[#3D2B2B] dark:text-stone-50 text-sm">Aura AI Assistant</h3>
              {user ? (
                <p className="text-[10px] text-[#4A3E3E]/70">
                  Customized for <span className="font-semibold text-pink-500">{user.skinType} skin</span>
                </p>
              ) : (
                <p className="text-[10px] text-[#4A3E3E]/70">Beauty & Skincare Specialist</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="rounded-full p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900"
              title="Reset chat session"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              id="close-ai-assistant-btn"
              className="rounded-full p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* User parameters tag display */}
          {user && (
            <div className="rounded-2xl bg-white/70 dark:bg-[#25181A]/60 p-3 border border-pink-100/40 text-left space-y-1">
              <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">Active Profile Context</p>
              <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                <span>Skin: <strong className="text-stone-800 dark:text-stone-200">{user.skinType}</strong></span>
                <span>•</span>
                <span>Hair: <strong className="text-stone-800 dark:text-stone-200">{user.hairType}</strong></span>
              </div>
            </div>
          )}

          {/* Preset Prompts (Show when only initial welcome is present) */}
          {messages.length === 1 && (
            <div className="space-y-2 text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-1">Quick Recommendations</p>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.prompt)}
                    className="w-full text-left p-3 rounded-2xl bg-white border border-pink-100/50 text-xs text-[#4A3E3E] hover:bg-pink-50/50 hover:border-pink-300 dark:bg-[#25181A] dark:border-[#3D2B2B] dark:text-stone-300 dark:hover:bg-rose-950/20 dark:hover:border-pink-900 transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation list */}
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] text-left ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                  m.role === "user" 
                    ? "bg-pink-100 text-pink-600 dark:bg-pink-950/40" 
                    : "bg-gradient-to-tr from-pink-400 to-pink-600 text-white"
                }`}>
                  {m.role === "user" ? <UserIcon size={12} /> : <Bot size={12} />}
                </div>

                {/* Bubble content */}
                <div className={`rounded-2xl p-4 text-xs ${
                  m.role === "user"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-white border border-pink-100/30 shadow-xs dark:bg-[#25181A] dark:border-[#3D2B2B]"
                }`}>
                  {m.role === "user" ? (
                    <p className="leading-relaxed font-light">{m.text}</p>
                  ) : (
                    <div className="space-y-1">{formatResponse(m.text)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking status */}
            {loading && (
              <div className="flex gap-2 mr-auto max-w-[85%] text-left">
                <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-tr from-pink-400 to-pink-600 text-white">
                  <Bot size={12} />
                </div>
                <div className="rounded-2xl p-4 bg-white border border-pink-100/30 shadow-xs dark:bg-[#25181A] dark:border-[#3D2B2B] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-2 max-w-[90%] mx-auto bg-red-50 text-red-600 rounded-2xl p-3 text-xs items-start border border-red-100">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* Input box form */}
        <div className="border-t border-pink-100 bg-white/95 dark:bg-[#25181A]/95 p-3 dark:border-rose-950/20">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Aura skincare recipes, ingredients..."
              disabled={loading}
              className="flex-1 rounded-full border border-pink-100 bg-pink-50/35 py-2.5 px-5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-[#FFEFEF] focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="rounded-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-4 py-2.5 flex items-center justify-center transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
          <p className="text-[9px] text-stone-400 text-center mt-2">
            Aura generates recommendations based on active dermatological guidelines. Always consult a physician for prescription skin allergies.
          </p>
        </div>

      </div>
    </div>
  );
}
