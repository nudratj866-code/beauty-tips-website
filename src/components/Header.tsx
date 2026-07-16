import React, { useState } from "react";
import { Sparkles, Search, Sun, Moon, LogIn, LogOut, User as UserIcon, Settings, Menu, X } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  user: User | null;
  onOpenAuth: (mode?: "signin" | "signup") => void;
  onLogout: () => void;
  onOpenAI: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentCategory: string;
  setCurrentCategory: (cat: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({
  user,
  onOpenAuth,
  onLogout,
  onOpenAI,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setSearchQuery("");
    setActiveTab("explore");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/90 backdrop-blur-md dark:border-rose-950/20 dark:bg-[#1A0F11]/90 transition-colors duration-200 shadow-xs">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center gap-2 group"
          id="header-logo-container"
        >
          <div className="w-8 h-8 bg-pink-400 dark:bg-pink-600 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-pink-900 dark:text-pink-100 font-sans">
            AURA <span className="font-light text-pink-500">BEAUTY</span>
          </span>
        </div>

        {/* Central Search or Quick Navigation links */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400 dark:text-pink-300" />
            <input
              type="text"
              placeholder="Search glowing skincare, makeup tips, natural remedies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-0 bg-pink-50/50 focus:bg-white py-1.5 pl-10 pr-4 text-xs outline-hidden transition-all focus:ring-1 focus:ring-pink-200 dark:bg-[#2A1F21] dark:text-stone-100 dark:focus:ring-pink-900"
            />
          </div>
        </div>

        {/* Desktop Controls */}
        <nav className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setActiveTab("explore")}
            className={`text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "explore" 
                ? "text-pink-600 dark:text-pink-400" 
                : "text-stone-600 hover:text-pink-600 dark:text-stone-300 dark:hover:text-pink-400"
            }`}
          >
            Explore Tips
          </button>
          
          {user && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`text-xs font-semibold tracking-wide transition-colors ${
                activeTab === "profile" 
                  ? "text-pink-600 dark:text-pink-400" 
                  : "text-stone-600 hover:text-pink-600 dark:text-stone-300 dark:hover:text-pink-400"
              }`}
            >
              My Favorites
            </button>
          )}

          {user?.isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`text-xs font-semibold tracking-wide transition-colors ${
                activeTab === "admin" 
                  ? "text-pink-600 dark:text-pink-400" 
                  : "text-stone-600 hover:text-pink-600 dark:text-stone-300 dark:hover:text-pink-400"
              }`}
            >
              Admin Board
            </button>
          )}

          {/* AI Helper Trigger */}
          <button
            onClick={onOpenAI}
            id="ai-helper-trigger"
            className="flex items-center gap-1.5 rounded-full bg-pink-100/60 hover:bg-pink-200/60 dark:bg-pink-950/40 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-3.5 py-1.5 text-xs font-semibold transition-transform active:scale-95"
          >
            <Sparkles size={14} className="animate-pulse" />
            AI Expert
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            id="theme-toggle-btn"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-900/80 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Authentication State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="user-menu-trigger"
                className="flex items-center gap-2 focus:outline-hidden group"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-rose-100 group-hover:ring-rose-300 dark:ring-rose-950"
                />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-2 shadow-xl dark:bg-[#150f11] ring-1 ring-black/5 dark:ring-white/5 border border-rose-100/20 dark:border-rose-950/20">
                  <div className="px-3 py-2 border-b border-stone-50 dark:border-stone-900 mb-1">
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">{user.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs text-stone-600 hover:bg-pink-50 hover:text-pink-600 dark:text-stone-300 dark:hover:bg-rose-950/20 dark:hover:text-pink-400"
                  >
                    <UserIcon size={14} />
                    My Profile
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab("admin");
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs text-stone-600 hover:bg-pink-50 hover:text-pink-600 dark:text-stone-300 dark:hover:bg-rose-950/20 dark:hover:text-pink-400"
                    >
                      <Settings size={14} />
                      Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth("signin")}
              id="signin-trigger"
              className="flex items-center gap-1.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-1.5 text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all"
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onOpenAI}
            className="rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/50 p-2"
          >
            <Sparkles size={16} />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="rounded-full p-2 text-stone-500 dark:text-stone-400"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-stone-600 dark:text-stone-300"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white dark:bg-[#1A0F11] dark:border-stone-900 px-4 py-4 space-y-3 shadow-inner">
          <div className="relative w-full mb-3">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search glowing skincare, makeup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-stone-100 bg-stone-50 py-1.5 pl-10 pr-4 text-xs dark:bg-[#2A1F21] dark:border-stone-800 dark:text-stone-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab("explore");
                setMobileMenuOpen(false);
              }}
              className={`rounded-xl p-2.5 text-center text-xs font-semibold border ${
                activeTab === "explore" 
                  ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-950/20 dark:border-pink-900" 
                  : "bg-stone-50 border-stone-100 text-stone-600 dark:bg-[#2A1F21] dark:border-stone-900 dark:text-stone-300"
              }`}
            >
              Explore Tips
            </button>
            {user && (
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setMobileMenuOpen(false);
                }}
                className={`rounded-xl p-2.5 text-center text-xs font-semibold border ${
                  activeTab === "profile" 
                    ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-950/20 dark:border-pink-900" 
                    : "bg-stone-50 border-stone-100 text-stone-600 dark:bg-[#2A1F21] dark:border-stone-900 dark:text-stone-300"
                }`}
              >
                Favorites
              </button>
            )}
          </div>

          {user?.isAdmin && (
            <button
              onClick={() => {
                setActiveTab("admin");
                setMobileMenuOpen(false);
              }}
              className="w-full rounded-xl bg-stone-50 border border-stone-100 dark:bg-[#2A1F21] dark:border-stone-900 text-stone-600 dark:text-stone-300 p-2.5 text-xs text-center font-semibold block"
            >
              Admin Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-stone-50 dark:border-stone-900/50 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{user.name}</p>
                    <p className="text-[10px] text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-full bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth("signin");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white py-2 text-xs font-semibold"
              >
                <LogIn size={14} />
                Sign In / Join Now
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
