import React, { useState } from "react";
import { User, Article } from "../types";
import { ShieldAlert, CheckCircle, Edit3, Settings, Lock, Heart, Bookmark, Eye, Mail } from "lucide-react";

interface ProfileTabProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  savedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
}

export default function ProfileTab({
  user,
  onUpdateUser,
  savedArticles,
  onSelectArticle,
  onOpenAuth
}: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [skinType, setSkinType] = useState(user.skinType);
  const [hairType, setHairType] = useState(user.hairType);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Change password form state
  const [showPassForm, setShowPassForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, bio, skinType, hairType, avatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      onUpdateUser(data.user);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");

      setPassSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowPassForm(false), 2000);
    } catch (err: any) {
      setPassError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 text-left">
      
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-pink-100/50 bg-white p-6 sm:p-8 shadow-xs dark:bg-[#25181A] dark:border-rose-950/20">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-pink-100/20 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          {/* Avatar display */}
          <div className="relative group">
            <img
              src={avatar}
              alt={user.name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-950/50"
            />
            {editing && (
              <input
                type="text"
                placeholder="Image URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="absolute -bottom-2 -left-2 w-28 text-[9px] bg-white border border-pink-200 rounded-md p-1 focus:outline-hidden"
                title="Enter an Unsplash URL to change avatar"
              />
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-bold font-serif text-[#3D2B2B] dark:text-stone-50">{user.name}</h2>
              <div className="flex justify-center sm:justify-start items-center gap-1.5">
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <CheckCircle size={10} /> Verified Member
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenAuth("signup")}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/10 dark:text-amber-400 hover:bg-amber-100 cursor-pointer"
                  >
                    <ShieldAlert size={10} /> Click to Verify Email
                  </button>
                )}
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700 dark:bg-[#1A0F11] dark:text-pink-400 border border-pink-100/35">
                    Editorial Director
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#4A3E3E]/60 dark:text-stone-400">{user.email}</p>
            <p className="text-xs text-[#4A3E3E] dark:text-stone-300 font-light leading-relaxed max-w-xl">{user.bio}</p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2 text-xs">
              <span className="rounded-lg bg-pink-50/40 border border-pink-100/30 dark:bg-stone-900/60 dark:border-stone-800 px-3 py-1 text-[#4A3E3E] dark:text-stone-300">
                Skin Profile: <strong className="text-pink-600 dark:text-pink-400">{user.skinType}</strong>
              </span>
              <span className="rounded-lg bg-pink-50/40 border border-pink-100/30 dark:bg-stone-900/60 dark:border-stone-800 px-3 py-1 text-[#4A3E3E] dark:text-stone-300">
                Hair Profile: <strong className="text-pink-600 dark:text-pink-400">{user.hairType}</strong>
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setEditing(!editing);
                setError(null);
                setSuccess(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 px-3 py-2 text-xs font-semibold"
            >
              <Edit3 size={14} />
              <span>{editing ? "Cancel" : "Edit Profile"}</span>
            </button>
            <button
              onClick={() => setShowPassForm(!showPassForm)}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 px-3 py-2 text-xs font-semibold"
            >
              <Lock size={14} />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Edit details form */}
        {editing && (
          <form onSubmit={handleUpdateProfile} className="mt-8 border-t border-stone-50 dark:border-stone-900 pt-6 space-y-4">
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-emerald-500">{success}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 px-3 text-xs outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 px-3 text-xs outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 px-3 text-xs outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Skin Type Selection</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                >
                  <option>Normal</option>
                  <option>Dry</option>
                  <option>Oily</option>
                  <option>Combination</option>
                  <option>Sensitive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Hair Type Selection</label>
                <select
                  value={hairType}
                  onChange={(e) => setHairType(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                >
                  <option>Straight</option>
                  <option>Wavy</option>
                  <option>Curly</option>
                  <option>Coily</option>
                  <option>Fine</option>
                  <option>Thick</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-5 text-xs transition-all cursor-pointer"
            >
              {loading ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        )}

        {/* Change password security block */}
        {showPassForm && (
          <form onSubmit={handleChangePassword} className="mt-8 border-t border-[#3D2B2B]/10 dark:border-stone-900 pt-6 space-y-4 max-w-sm">
            <h4 className="font-serif font-bold text-[#3D2B2B] dark:text-stone-100 text-sm">Update Password</h4>
            
            {passError && <p className="text-xs text-red-500">{passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-500">{passSuccess}</p>}

            <div>
              <label className="block text-[10px] font-medium text-[#4A3E3E] dark:text-stone-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/10 py-1.5 px-3 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#4A3E3E] dark:text-stone-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/10 py-1.5 px-3 text-xs outline-hidden dark:border-rose-950 dark:bg-[#1A0F11] dark:text-stone-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#3D2B2B] text-white hover:bg-black dark:bg-pink-600 dark:hover:bg-pink-700 py-1.5 px-4 text-xs font-semibold cursor-pointer"
            >
              Save New Password
            </button>
          </form>
        )}
      </div>

      {/* Bookmarked / Saved Articles Tab Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-serif text-[#3D2B2B] dark:text-stone-50 flex items-center gap-2 border-b border-pink-100 dark:border-rose-950/20 pb-4">
          <Bookmark size={20} className="text-pink-500 fill-pink-500" />
          My Saved Beauty Routines & Secrets ({savedArticles.length})
        </h3>

        {savedArticles.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-pink-100/80 dark:border-rose-950/20 p-12 text-center space-y-3 bg-white dark:bg-[#25181A]">
            <Heart size={36} className="mx-auto text-pink-300 dark:text-stone-700" />
            <p className="text-xs text-[#4A3E3E] dark:text-stone-400">You haven't saved any tips yet.</p>
            <p className="text-[10px] text-stone-400">Explore our professional beauty articles and click the bookmark icon to save them to your routine chest!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group overflow-hidden rounded-[2rem] border border-pink-100/80 bg-white shadow-xs hover:shadow-md dark:border-rose-950/20 dark:bg-[#25181A] transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/95 dark:bg-[#1A0F11]/95 px-2.5 py-0.5 text-[9px] font-bold text-pink-500">
                    {art.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-[9px] text-[#4A3E3E]/60 dark:text-stone-400 font-medium">{art.date} • {art.readingTime}</p>
                    <h4 className="font-serif font-bold text-xs text-[#3D2B2B] dark:text-[#FFEFEF] group-hover:text-pink-500 line-clamp-2 mt-1">
                      {art.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-pink-50 dark:border-stone-900">
                    <span className="italic">By {art.author}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> View details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
