import React, { useState } from "react";
import { Sparkles, ArrowRight, Heart, Bell, CheckCircle } from "lucide-react";
import { CATEGORIES } from "../types";

interface HeroProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

export default function Hero({ onCategorySelect, selectedCategory }: HeroProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setMessage("Subscribed successfully! Keep an eye on your inbox.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      
      {/* Bento Collage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Bento Hero Card */}
        <div className="lg:col-span-8 bg-white dark:bg-[#25181A] border border-pink-100/80 dark:border-rose-950/50 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-xs">
          {/* Abstract background highlight */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-pink-100/40 dark:bg-pink-900/10 blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 dark:bg-pink-950/30 px-3.5 py-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 border border-pink-100/50">
              <Sparkles size={14} className="animate-pulse" />
              <span>Dermatologist Approved Tips & Routine Guides</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-[#3D2B2B] dark:text-[#FFEFEF] leading-tight">
              Embrace Your Natural <br className="hidden sm:inline" />
              <span className="relative inline-block mt-1">
                <span className="relative z-10 text-pink-500 dark:text-pink-400">Radiance & Glow</span>
                <span className="absolute left-0 bottom-1.5 h-2 w-full bg-pink-100/40 dark:bg-pink-950/40 z-0 rounded-full" />
              </span>
            </h1>

            <p className="text-[#4A3E3E] dark:text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed font-normal">
              Discover customized professional tutorials, natural herbal formulations, and advanced bridal checklists. Optimize your beauty habits with our 24/7 AI skin specialist.
            </p>
          </div>

          {/* Newsletter Form section inside bento */}
          <div className="mt-8 max-w-md relative z-10">
            <form onSubmit={handleSubscribe} className="flex gap-2 items-center bg-pink-50/50 dark:bg-[#1A0F11]/50 p-1.5 rounded-full border border-pink-100/30">
              <input
                type="email"
                required
                placeholder="Enter your email for weekly glow tips..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-2 px-4 text-xs outline-hidden text-[#3D2B2B] dark:text-stone-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2.5 text-xs shadow-md transition-all shrink-0 hover:scale-[1.02] flex items-center gap-1.5"
              >
                {loading ? "Subscribing..." : (
                  <>
                    <span>Join Free</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
            {message && (
              <div className="mt-3 flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 px-3">
                <CheckCircle size={14} />
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Badge highlights */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#4A3E3E] dark:text-stone-400 pt-8 mt-4 border-t border-pink-100/50">
            <span className="flex items-center gap-1.5 font-semibold">
              <Heart size={14} className="text-pink-500 fill-pink-500" /> 10k+ Saved Routines
            </span>
            <span className="text-[#4A3E3E]/20">•</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Bell size={14} className="text-pink-500" /> Daily Updates
            </span>
          </div>
        </div>

        {/* Aesthetic Image Bento Card */}
        <div className="lg:col-span-4 bg-[#3D2B2B] rounded-[2.5rem] overflow-hidden relative min-h-[350px] shadow-sm group">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop"
            alt="Radiant Skin Beauty"
            className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-8">
            <div className="flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-pink-500 text-white px-2.5 py-1 rounded-full">Trending</span>
            </div>
            
            <div className="text-white text-left space-y-1">
              <p className="font-serif text-xl font-bold">The 7-Step Morning Glass Skin Routine</p>
              <p className="text-xs text-stone-200 font-light">Simple organic formulations for a deep glow</p>
            </div>
          </div>
        </div>

      </div>

      {/* Categories Bento filter Bar */}
      <div className="mt-8 bg-white dark:bg-[#25181A] border border-pink-100/80 dark:border-rose-950/50 rounded-[2rem] p-6 shadow-xs text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#4A3E3E] dark:text-stone-400 mb-4">
          Select Category to Filter Tips
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
          <button
            onClick={() => onCategorySelect("All")}
            className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all ${
              selectedCategory === "All"
                ? "bg-pink-500 text-white shadow-md shadow-pink-200/50 scale-105"
                : "bg-pink-50/50 text-[#4A3E3E] hover:bg-pink-100/50 border border-transparent dark:bg-[#1A0F11]/50 dark:text-stone-300 dark:hover:bg-rose-950/20"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === cat
                  ? "bg-pink-500 text-white shadow-md shadow-pink-200/50 scale-105"
                  : "bg-pink-50/50 text-[#4A3E3E] hover:bg-pink-100/50 border border-transparent dark:bg-[#1A0F11]/50 dark:text-stone-300 dark:hover:bg-rose-950/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
