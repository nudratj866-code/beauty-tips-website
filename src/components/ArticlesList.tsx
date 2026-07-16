import React, { useState } from "react";
import { Heart, MessageSquare, Clock, Bookmark, ArrowUpRight, Award, Trash2 } from "lucide-react";
import { Article, User } from "../types";

interface ArticlesListProps {
  articles: Article[];
  user: User | null;
  onSelectArticle: (article: Article) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void; // Admin only delete
  loading?: boolean;
}

export default function ArticlesList({
  articles,
  user,
  onSelectArticle,
  onLike,
  onFavorite,
  onDelete,
  loading = false
}: ArticlesListProps) {
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  // Sort logic
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likesCount - a.likesCount;
    }
    // Default to latest (assume newer date first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-stone-100 bg-white p-4 space-y-4 dark:bg-[#140e10] dark:border-stone-900">
            <div className="h-48 w-full rounded-2xl animate-shimmer" />
            <div className="h-4 w-1/4 rounded-md animate-shimmer" />
            <div className="h-6 w-3/4 rounded-md animate-shimmer" />
            <div className="h-10 w-full rounded-md animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (sortedArticles.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40">
          <Bookmark size={28} />
        </div>
        <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">No Articles Found</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          We couldn't find any articles matching your search query or filters. Try checking your spelling or selecting other categories.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 space-y-6">
      
      {/* Top Filter and sorting header */}
      <div className="flex items-center justify-between border-b border-pink-100 dark:border-rose-950/20 pb-4">
        <h2 className="text-xl font-bold font-serif text-[#3D2B2B] dark:text-stone-50 flex items-center gap-2">
          <Award size={20} className="text-pink-500" />
          Featured Beauty Guides
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A3E3E] dark:text-stone-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
            className="rounded-xl border border-pink-100 bg-white px-3 py-1 text-xs outline-hidden text-[#4A3E3E] dark:bg-[#1A0F11] dark:border-rose-950/30 dark:text-stone-300 focus:ring-1 focus:ring-pink-300"
          >
            <option value="latest">Latest Updates</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Grid of articles with asymmetric bento layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.map((art, idx) => {
          const isFirst = idx === 0;
          const isBookmarked = user?.favorites.includes(art.id);

          return (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-pink-100/80 bg-white shadow-xs hover:shadow-md dark:border-rose-950/20 dark:bg-[#25181A] transition-all hover:-translate-y-1 cursor-pointer ${
                isFirst ? "md:col-span-2 lg:col-span-2 md:flex-row" : ""
              }`}
            >
              
              {/* Header Image */}
              <div className={`relative overflow-hidden ${
                isFirst ? "md:h-auto md:w-1/2 w-full min-h-[220px]" : "h-52 w-full"
              }`}>
                <img
                  src={art.image}
                  alt={art.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Category badge */}
                <span className="absolute top-4 left-4 rounded-full bg-white/95 dark:bg-[#1A0F11]/90 backdrop-blur-xs px-3.5 py-1 text-[10px] font-bold text-pink-600 dark:text-pink-400 shadow-sm border border-pink-100/25">
                  {art.category}
                </span>

                {/* Bookmark Toggle (Requires Auth) */}
                <button
                  onClick={(e) => onFavorite(art.id, e)}
                  className={`absolute top-4 right-4 rounded-full p-2.5 backdrop-blur-xs transition-all hover:scale-110 shadow-xs ${
                    isBookmarked
                      ? "bg-pink-500 text-white"
                      : "bg-white/90 text-[#4A3E3E] hover:text-pink-500 dark:bg-[#1A0F11]/95 dark:text-stone-300"
                  }`}
                  title={isBookmarked ? "Saved in favorites" : "Save to favorites"}
                >
                  <Bookmark size={14} className={isBookmarked ? "fill-white" : ""} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#4A3E3E]/60 dark:text-stone-400">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {art.readingTime}
                    </span>
                  </div>

                  <h3 className={`font-serif font-bold text-[#3D2B2B] dark:text-[#FFEFEF] group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors line-clamp-2 leading-snug ${
                    isFirst ? "text-xl sm:text-2xl" : "text-lg"
                  }`}>
                    {art.title}
                  </h3>

                  <p className="text-xs text-[#4A3E3E]/85 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between pt-4 border-t border-pink-100/50 dark:border-rose-950/20 mt-4">
                  <span className="text-[10px] font-semibold text-[#4A3E3E]/80 dark:text-stone-400 italic">
                    By {art.author}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    {/* Like Counter */}
                    <button
                      onClick={(e) => onLike(art.id, e)}
                      className="flex items-center gap-1.5 hover:text-pink-500 dark:hover:text-pink-400 transition-colors py-1 px-2.5 rounded-xl hover:bg-pink-50/50 dark:hover:bg-rose-950/20"
                    >
                      <Heart size={14} className="hover:scale-110 active:scale-90 text-pink-400" />
                      <span className="font-semibold text-stone-600 dark:text-stone-300 text-[11px]">{art.likesCount}</span>
                    </button>

                    {/* Comments Counter */}
                    <span className="flex items-center gap-1.5 py-1 px-2.5 text-stone-400">
                      <MessageSquare size={14} />
                      <span className="font-semibold text-stone-500 dark:text-stone-400 text-[11px]">{art.comments.length}</span>
                    </span>

                    {/* Admin Delete Action */}
                    {user?.isAdmin && onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this article?")) {
                            onDelete(art.id);
                          }
                        }}
                        className="rounded-xl p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete article (Admin only)"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </article>
          );
        })}
      </div>
    </div>
  );
}
