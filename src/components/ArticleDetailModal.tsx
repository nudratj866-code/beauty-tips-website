import React, { useState } from "react";
import { X, Heart, Bookmark, MessageSquare, Calendar, User as UserIcon, Send, Share2, Copy, CheckCircle } from "lucide-react";
import { Article, User } from "../types";

interface ArticleDetailModalProps {
  article: Article;
  user: User | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onAddComment: (articleId: string, username: string, content: string) => Promise<void>;
}

export default function ArticleDetailModal({
  article,
  user,
  onClose,
  onLike,
  onFavorite,
  onAddComment
}: ArticleDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLikeClick = () => {
    onLike(article.id);
  };

  const handleFavoriteClick = () => {
    onFavorite(article.id);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const username = user ? user.name : "Anonymous Beauty";
    setCommenting(true);
    setCommentError(null);

    try {
      await onAddComment(article.id, username, newComment);
      setNewComment("");
    } catch (err) {
      setCommentError("Could not submit your comment. Please try again.");
    } finally {
      setCommenting(false);
    }
  };

  const handleShareCopy = () => {
    const url = `${window.location.origin}/articles/${article.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe formatting to convert Markdown headings and bold text into elegant stylized HTML paragraphs
  const renderContent = (txt: string) => {
    return txt.split("\n\n").map((para, i) => {
      // Check if it's a heading
      if (para.startsWith("### ")) {
        return (
          <h4 key={i} className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mt-6 mb-2">
            {para.replace("### ", "")}
          </h4>
        );
      }
      if (para.startsWith("## ")) {
        return (
          <h3 key={i} className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-8 mb-3 border-b border-pink-100 pb-1">
            {para.replace("## ", "")}
          </h3>
        );
      }
      if (para.startsWith("- ") || para.startsWith("* ")) {
        const items = para.split("\n").map(item => item.replace(/^[-*]\s+/, ""));
        return (
          <ul key={i} className="list-disc pl-5 my-4 space-y-1.5 text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
            {items.map((it, idx) => {
              // Simple check for bold inline words
              const parts = it.split(/\*\*(.*?)\*\*/g);
              return (
                <li key={idx}>
                  {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-pink-700 dark:text-pink-400">{p}</strong> : p)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Check for inline bold text in regular paragraphs
      const parts = para.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-4 font-light">
          {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-pink-700 dark:text-pink-400">{p}</strong> : p)}
        </p>
      );
    });
  };

  const isFavorited = user?.favorites.includes(article.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      {/* Click outside backdrop close handler */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative h-full w-full max-w-2xl bg-white dark:bg-[#1A0F11] shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 z-10 border-l border-pink-100">
        
        {/* Floating close btn */}
        <button
          onClick={onClose}
          id="close-article-detail-btn"
          className="absolute top-4 right-4 z-20 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Content Container */}
        <div className="flex-1">
          
          {/* Header Hero Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            
            {/* Meta tags overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white text-left space-y-2">
              <span className="rounded-full bg-pink-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                {article.category}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-stone-300 text-xs font-light pt-1">
                <span className="flex items-center gap-1">
                  <UserIcon size={12} /> By {article.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {article.date}
                </span>
                <span>•</span>
                <span>{article.readingTime}</span>
              </div>
            </div>
          </div>

          {/* Article Reading Body */}
          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="prose prose-stone dark:prose-invert max-w-none">
              {renderContent(article.content)}
            </div>

            {/* Interactions footer bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-pink-100/40 dark:border-stone-800 mt-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeClick}
                  className="flex items-center gap-1.5 rounded-full bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 px-4 py-2 text-xs font-semibold transition-all active:scale-95"
                >
                  <Heart size={14} className="fill-pink-500 text-pink-500" />
                  <span>Liked ({article.likesCount})</span>
                </button>

                <button
                  onClick={handleFavoriteClick}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                    isFavorited
                      ? "bg-pink-600 text-white"
                      : "bg-stone-50 hover:bg-stone-100 dark:bg-[#25181A] text-[#4A3E3E] dark:text-stone-300"
                  }`}
                >
                  <Bookmark size={14} className={isFavorited ? "fill-white" : ""} />
                  <span>{isFavorited ? "Saved" : "Save Tip"}</span>
                </button>
              </div>

              {/* Share block */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="flex items-center gap-1.5 rounded-full bg-stone-50 hover:bg-stone-100 dark:bg-[#150f11] text-stone-600 dark:text-stone-300 px-4 py-2 text-xs font-semibold"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>

                {shareOpen && (
                  <div className="absolute right-0 bottom-12 w-52 rounded-xl bg-white p-3 shadow-xl dark:bg-[#1b1517] ring-1 ring-black/5 dark:ring-white/5 border border-stone-100 dark:border-stone-800 z-30">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Share this beauty tip</p>
                    <button
                      onClick={handleShareCopy}
                      className="flex w-full items-center justify-between rounded-lg bg-stone-50 dark:bg-[#140e10] p-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-rose-50/50"
                    >
                      <span className="truncate pr-2">{copied ? "Copied Link!" : "Copy URL"}</span>
                      {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments block */}
            <div className="space-y-6 pt-4">
              <h3 className="font-serif text-lg font-bold text-[#3D2B2B] dark:text-stone-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-pink-500" />
                Discussion & Feedback ({article.comments.length})
              </h3>

              {/* Add Comment form */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                {commentError && <p className="text-xs text-red-500">{commentError}</p>}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Write a caring comment..." : "Sign in to leave feedback..."}
                    disabled={commenting || !user}
                    className="flex-1 rounded-xl border border-pink-100 bg-pink-50/20 py-2.5 px-4 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-200 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={commenting || !user || !newComment.trim()}
                    className="rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-55 text-white px-4 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
                {!user && (
                  <p className="text-[10px] text-stone-400 italic">
                    *Join the Aura club to write comments and discuss recipes.
                  </p>
                )}
              </form>

              {/* Comments list */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {article.comments.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No comments yet. Be the first to share your experience!</p>
                ) : (
                  article.comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl bg-pink-50/25 dark:bg-[#25181A] p-4 border border-pink-100/50 dark:border-stone-900/40 text-left space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                          {comment.username}
                        </span>
                        <span className="text-[9px] text-stone-400">{comment.date}</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
