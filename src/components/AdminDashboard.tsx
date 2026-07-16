import React, { useState, useEffect } from "react";
import { User, Article, CATEGORIES } from "../types";
import { Users, FileText, Heart, MessageSquare, PlusCircle, Trash, CheckCircle, BarChart3, Mail } from "lucide-react";

interface AdminDashboardProps {
  user: User;
  articles: Article[];
  onAddArticle: (newArticle: any) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export default function AdminDashboard({
  user,
  articles,
  onAddArticle,
  onDeleteArticle,
  onDeleteComment
}: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New article form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [readingTime, setReadingTime] = useState("4 min read");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load admin metrics.");
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [articles]);

  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess(null);

    const placeholderImage = image.trim() || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop";

    try {
      await onAddArticle({
        title,
        category,
        excerpt: excerpt.trim() || content.substring(0, 100) + "...",
        content,
        image: placeholderImage,
        readingTime
      });

      setFormSuccess("Article published successfully!");
      setTitle("");
      setExcerpt("");
      setContent("");
      setImage("");
      setReadingTime("4 min read");
    } catch (err: any) {
      setError(err.message || "Failed to publish article.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 space-y-4 text-left">
        <h3 className="text-xl font-bold font-serif text-pink-600">Access Restricted</h3>
        <p className="text-xs text-[#4A3E3E] dark:text-stone-400">Only verified Aura Beauty Editors have permission to view the administrator dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-pink-100 dark:border-rose-950/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#3D2B2B] dark:text-stone-50">Editor & Admin Terminal</h2>
          <p className="text-xs text-[#4A3E3E]/70 dark:text-stone-400">Analyze beauty traffic, publish curated tips, and moderate discussion boards.</p>
        </div>
        <button
          onClick={fetchStats}
          className="mt-2 sm:mt-0 rounded-xl bg-pink-50 hover:bg-pink-100/80 dark:bg-[#1A0F11] dark:hover:bg-[#25181A] px-4 py-2 text-xs font-semibold text-[#4A3E3E] hover:text-pink-600 dark:text-stone-300 border border-pink-100/40 cursor-pointer"
        >
          Refresh Live Metrics
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Live analytics tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[2rem] border border-pink-100/60 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20">
              <div className="flex items-center justify-between text-[#4A3E3E]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Members</span>
                <Users size={16} className="text-pink-500" />
              </div>
              <p className="text-2xl font-bold text-[#3D2B2B] dark:text-stone-100 mt-2">{stats.usersCount}</p>
              <p className="text-[9px] text-[#4A3E3E]/60 mt-0.5">Active beauty profiles</p>
            </div>

            <div className="rounded-[2rem] border border-pink-100/60 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20">
              <div className="flex items-center justify-between text-[#4A3E3E]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Beauty Guides</span>
                <FileText size={16} className="text-pink-500" />
              </div>
              <p className="text-2xl font-bold text-[#3D2B2B] dark:text-stone-100 mt-2">{stats.articlesCount}</p>
              <p className="text-[9px] text-[#4A3E3E]/60 mt-0.5">Seeded category articles</p>
            </div>

            <div className="rounded-[2rem] border border-pink-100/60 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20">
              <div className="flex items-center justify-between text-[#4A3E3E]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Glow Subscribers</span>
                <Mail size={16} className="text-pink-500" />
              </div>
              <p className="text-2xl font-bold text-[#3D2B2B] dark:text-stone-100 mt-2">{stats.newsletterCount}</p>
              <p className="text-[9px] text-[#4A3E3E]/60 mt-0.5">Newsletter recipients</p>
            </div>

            <div className="rounded-[2rem] border border-pink-100/60 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20">
              <div className="flex items-center justify-between text-[#4A3E3E]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Reader Appreciations</span>
                <Heart size={16} className="text-pink-500" />
              </div>
              <p className="text-2xl font-bold text-[#3D2B2B] dark:text-stone-100 mt-2">{stats.totalLikes}</p>
              <p className="text-[9px] text-[#4A3E3E]/60 mt-0.5">Likes & saves combined</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Create Article and Comment Moderation */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Add New Article Form */}
              <div className="rounded-[2.5rem] border border-pink-100 bg-white p-6 sm:p-8 dark:bg-[#25181A] dark:border-rose-950/20">
                <h3 className="text-lg font-serif font-bold text-[#3D2B2B] dark:text-stone-50 flex items-center gap-2 mb-4">
                  <PlusCircle size={18} className="text-pink-500" />
                  Publish Curated Tip Guide
                </h3>

                {formSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <CheckCircle size={14} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateArticleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Article Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Secret Rosewater Hydrating Spray Recipe"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Beauty Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Image URL (Unsplash or direct link)</label>
                      <input
                        type="text"
                        placeholder="Leave blank for automatic theme cover"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Est. Reading Time</label>
                      <input
                        type="text"
                        required
                        value={readingTime}
                        onChange={(e) => setReadingTime(e.target.value)}
                        className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Excerpt Summary</label>
                    <input
                      type="text"
                      placeholder="Brief card pitch..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">Curated Article Guide Content (Markdown support: ### Headings, **Bolds**, Bullet points)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Share steps, active ingredients, and tips details..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100 font-sans focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium py-2 px-5 text-xs transition-all shadow-md cursor-pointer"
                  >
                    {submitting ? "Publishing..." : "Publish Article live"}
                  </button>
                </form>
              </div>

              {/* Discussion Comment Moderation list */}
              <div className="rounded-[2.5rem] border border-pink-100 bg-white p-6 sm:p-8 dark:bg-[#25181A] dark:border-rose-950/20">
                <h3 className="text-lg font-serif font-bold text-[#3D2B2B] dark:text-stone-50 flex items-center gap-2 mb-4">
                  <MessageSquare size={18} className="text-pink-500" />
                  Moderate Discussion Boards
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {articles.flatMap(art => art.comments.map(c => ({ ...c, articleTitle: art.title, articleId: art.id }))).length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No community comments posted yet.</p>
                  ) : (
                    articles.flatMap(art => art.comments.map(c => ({ ...c, articleTitle: art.title, articleId: art.id }))).map((comment) => (
                      <div key={comment.id} className="flex justify-between items-start gap-4 p-4 bg-pink-50/10 dark:bg-[#1A0F11] rounded-2xl border border-pink-100/30">
                        <div className="text-left space-y-1">
                          <p className="text-[10px] text-stone-400">
                            On: <span className="font-semibold text-pink-500">{comment.articleTitle}</span>
                          </p>
                          <p className="text-xs text-[#4A3E3E] dark:text-[#FFEFEF] font-medium">
                            <span className="text-pink-600 dark:text-pink-400 font-semibold">{comment.username}:</span> {comment.content}
                          </p>
                          <p className="text-[9px] text-stone-400">{comment.date}</p>
                        </div>

                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg shrink-0 cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right: Active Members List */}
            <div className="lg:col-span-4 space-y-8">
              <div className="rounded-[2.5rem] border border-pink-100 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2 mb-4">
                  <Users size={16} className="text-pink-500" />
                  Registered Club Members ({stats.usersList.length})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {stats.usersList.map((usr: any) => (
                    <div key={usr.id} className="flex items-center gap-3 py-1 border-b border-[#3D2B2B]/10 dark:border-[#3D2B2B]/30 pb-3 last:border-0">
                      <img src={usr.avatar} alt={usr.name} className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#3D2B2B] dark:text-stone-200 truncate">{usr.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{usr.email}</p>
                        <div className="flex gap-1.5 mt-0.5">
                          <span className="bg-pink-50 text-pink-600 dark:bg-[#1A0F11] dark:text-pink-400 text-[8px] font-bold px-1.5 rounded-sm border border-pink-100/20">
                            {usr.skinType}
                          </span>
                          <span className="bg-stone-50 text-stone-600 dark:bg-stone-900 dark:text-stone-300 text-[8px] font-bold px-1.5 rounded-sm border border-stone-200/20">
                            {usr.hairType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic details card */}
              <div className="rounded-[2.5rem] border border-pink-100 bg-white p-5 dark:bg-[#25181A] dark:border-rose-950/20 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-pink-500" />
                  Category Distributions
                </h3>
                
                <div className="space-y-2 text-xs">
                  {Object.entries(stats.categoryCounts || {}).map(([cat, count]: [string, any]) => (
                    <div key={cat} className="flex justify-between items-center py-1">
                      <span className="text-[#4A3E3E] dark:text-stone-300">{cat}</span>
                      <span className="bg-pink-50 dark:bg-[#1A0F11] text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-md font-bold text-[10px] border border-pink-100/30">{count} guides</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <p className="text-xs text-stone-500">Failed to render administrative console.</p>
      )}
    </div>
  );
}
