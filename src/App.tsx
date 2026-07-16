import React, { useState, useEffect } from "react";
import { User, Article } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ArticlesList from "./components/ArticlesList";
import ArticleDetailModal from "./components/ArticleDetailModal";
import AIAssistant from "./components/AIAssistant";
import AuthModal from "./components/AuthModal";
import ProfileTab from "./components/ProfileTab";
import AdminDashboard from "./components/AdminDashboard";
import { Heart, Sparkles, LogIn } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<string>("explore"); // explore, profile, admin
  
  // UI Overlays state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Light/Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Dark mode side-effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Load active session user on startup
  const loadProfileOnStartup = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch("/api/auth/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (err) {
      console.error("Failed to restore session profile", err);
    }
  };

  // Fetch articles based on query + filters
  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch(
        `/api/articles?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`
      );
      const data = await res.json();
      if (res.ok && data.articles) {
        setArticles(data.articles);
        
        // Keep the currently viewed article in sync if open
        if (selectedArticle) {
          const updated = data.articles.find((a: Article) => a.id === selectedArticle.id);
          if (updated) setSelectedArticle(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load beauty articles", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    loadProfileOnStartup();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [searchQuery, selectedCategory]);

  const handleOpenAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authUser: User, token: string) => {
    setUser(authUser);
    localStorage.setItem("authToken", token);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Logout request error", err);
    } finally {
      setUser(null);
      localStorage.removeItem("authToken");
      setActiveTab("explore");
    }
  };

  // Toggle liking of article
  const handleLikeArticle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const res = await fetch(`/api/articles/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        // Optimistically update lists and currently open article
        setArticles((prev) =>
          prev.map((art) => (art.id === id ? { ...art, likesCount: data.likesCount } : art))
        );
        if (selectedArticle && selectedArticle.id === id) {
          setSelectedArticle((prev) => prev ? { ...prev, likesCount: data.likesCount } : null);
        }
      }
    } catch (err) {
      console.error("Could not complete article like toggling.", err);
    }
  };

  // Toggle saving article to user favorites
  const handleFavoriteArticle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem("authToken");
    if (!token) {
      handleOpenAuth("signin");
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}/favorite`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local user state favorites list
      if (user) {
        setUser({ ...user, favorites: data.favorites });
      }
    } catch (err: any) {
      alert(err.message || "Failed to bookmark article.");
    }
  };

  // Add Comment Action
  const handleAddComment = async (articleId: string, username: string, content: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setArticles((prev) =>
        prev.map((art) => (art.id === articleId ? { ...art, comments: data.comments } : art))
      );
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle((prev) => prev ? { ...prev, comments: data.comments } : null);
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to submit comment.");
    }
  };

  // Admin Publish Action
  const handlePublishArticle = async (newArticleData: any) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newArticleData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Re-fetch articles
      await loadArticles();
    } catch (err: any) {
      throw new Error(err.message || "Failed to publish article.");
    }
  };

  // Admin Delete Article
  const handleDeleteArticle = async (id: string) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      await loadArticles();
    } catch (err: any) {
      alert(err.message || "Failed to delete article.");
    }
  };

  // Admin Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      await loadArticles();
    } catch (err: any) {
      alert(err.message || "Failed to delete comment.");
    }
  };

  const savedArticles = articles.filter((art) => user?.favorites.includes(art.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F9] dark:bg-[#1A0F11] transition-colors duration-200">
      
      {/* Premium Glassmorphism Navbar */}
      <Header
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenAI={() => setAiAssistantOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentCategory={selectedCategory}
        setCurrentCategory={setSelectedCategory}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Container Area */}
      <main className="flex-1">
        {activeTab === "explore" && (
          <div className="space-y-4">
            {/* Elegant Hero landing */}
            <Hero
              onCategorySelect={(cat) => {
                setSelectedCategory(cat);
                setActiveTab("explore");
              }}
              selectedCategory={selectedCategory}
            />

            {/* Articles Grid list container */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ArticlesList
                articles={articles}
                user={user}
                onSelectArticle={(art) => setSelectedArticle(art)}
                onLike={(id, e) => handleLikeArticle(id, e)}
                onFavorite={(id, e) => handleFavoriteArticle(id, e)}
                onDelete={handleDeleteArticle}
                loading={loadingArticles}
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && user && (
          <ProfileTab
            user={user}
            onUpdateUser={setUser}
            savedArticles={savedArticles}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === "admin" && user && (
          <AdminDashboard
            user={user}
            articles={articles}
            onAddArticle={handlePublishArticle}
            onDeleteArticle={handleDeleteArticle}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-pink-100 bg-white/60 dark:border-rose-950/20 dark:bg-[#25181A]/60 py-8 text-center text-xs text-stone-500 dark:text-[#FFEFEF]/60 mt-12 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <p className="font-serif text-sm font-bold tracking-tight text-[#3D2B2B] dark:text-stone-200">Aura Beauty Lounge</p>
          <p className="font-light max-w-md mx-auto leading-relaxed text-[#4A3E3E]/80 dark:text-[#FFEFEF]/75">
            Dermatologist assessment guides, customizable natural face masks, hair frizz combatting treatments, and premium bridal schedules.
          </p>
          <p className="text-[10px] text-stone-400 pt-2 border-t border-pink-100/50 dark:border-[#3D2B2B]/30">
            &copy; 2026 Aura Inc. Empowering your inner radiance. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* Sidebar Drawer Panels */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          user={user}
          onClose={() => setSelectedArticle(null)}
          onLike={(id) => handleLikeArticle(id)}
          onFavorite={(id) => handleFavoriteArticle(id)}
          onAddComment={handleAddComment}
        />
      )}

      <AIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        user={user}
      />

    </div>
  );
}
