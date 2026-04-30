"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/crm";
import {
  Plus, X, Edit2, Trash2, Eye, EyeOff,
  Globe, FileText, Archive, Search, ExternalLink,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_META = {
  published: { label: "Published", light: "text-green-700 bg-green-50 border-green-200",  dark: "text-green-400 bg-green-400/10 border-green-400/20",  icon: Globe },
  draft:     { label: "Draft",     light: "text-yellow-700 bg-yellow-50 border-yellow-200", dark: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: FileText },
  archived:  { label: "Archived",  light: "text-gray-500 bg-gray-100 border-gray-200",    dark: "text-white/35 bg-white/5 border-white/10",              icon: Archive },
} as const;

type StatusFilter = "all" | "published" | "draft" | "archived";

const EMPTY_FORM = {
  title: "", slug: "", excerpt: "", content: "",
  cover_image: "", author_name: "Deluxify Team",
  category: "AI Insights" as string, tags: "", status: "draft" as "draft" | "published" | "archived",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffBlogPage() {
  const { theme } = useTheme();
  const [mounted,     setMounted]     = useState(false);
  const [posts,       setPosts]       = useState<BlogPost[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<StatusFilter>("all");
  const [showModal,   setShowModal]   = useState(false);
  const [editPost,    setEditPost]    = useState<BlogPost | null>(null);
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [slugManual,  setSlugManual]  = useState(false);

  useEffect(() => setMounted(true), []);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const isLight = mounted && theme === "light";

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg       = isLight ? "bg-[#F4F4F5]" : "bg-[#0B0B0C]";
  const card     = isLight ? "bg-white border border-black/[0.07] shadow-sm" : "bg-[#111113] border border-white/[0.06]";
  const heading  = isLight ? "text-black" : "text-white";
  const subtext  = isLight ? "text-black/40" : "text-white/40";
  const inputCls = isLight
    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/30 focus:ring-[#2F8F89]"
    : "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:ring-[#2F8F89]";
  const divider  = isLight ? "border-black/[0.06]" : "border-white/[0.05]";
  const rowHover = isLight ? "hover:bg-black/[0.015]" : "hover:bg-white/[0.02]";

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || [p.title, p.author_name, p.category].some((v) => v?.toLowerCase().includes(q));
    const matchStatus = filter === "all" || p.status === filter;
    return matchSearch && matchStatus;
  });

  // ── Modal helpers ────────────────────────────────────────────────────────────
  function openCreate() {
    setEditPost(null);
    setForm({ ...EMPTY_FORM });
    setSlugManual(false);
    setShowModal(true);
  }

  function openEdit(p: BlogPost) {
    setEditPost(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt ?? "",
      content: p.content, cover_image: p.cover_image ?? "",
      author_name: p.author_name, category: p.category,
      tags: p.tags?.join(", ") ?? "", status: p.status,
    });
    setSlugManual(true);
    setShowModal(true);
  }

  function handleTitleChange(val: string) {
    setForm((f) => ({ ...f, title: val, slug: slugManual ? f.slug : toSlug(val) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

    const payload = {
      title:       form.title.trim(),
      slug:        form.slug.trim() || toSlug(form.title),
      excerpt:     form.excerpt.trim() || null,
      content:     form.content.trim(),
      cover_image: form.cover_image.trim() || null,
      author_name: form.author_name.trim() || "Deluxify Team",
      category:    form.category,
      tags:        form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      status:      form.status,
      published_at: form.status === "published" ? (editPost?.published_at ?? new Date().toISOString()) : null,
    };

    if (editPost) {
      await supabase.from("blog_posts").update(payload).eq("id", editPost.id);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    loadPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  async function toggleStatus(post: BlogPost) {
    const next = post.status === "published" ? "draft" : "published";
    const patch = { status: next as BlogPost["status"], published_at: next === "published" ? (post.published_at ?? new Date().toISOString()) : null };
    await supabase.from("blog_posts").update(patch).eq("id", post.id);
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, ...patch } : p));
  }

  // ── Counts for filter badges ─────────────────────────────────────────────────
  const counts = { all: posts.length, published: 0, draft: 0, archived: 0 };
  posts.forEach((p) => { counts[p.status as keyof typeof counts]++; });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className={`text-2xl font-bold ${heading}`}>Blog Posts</h2>
          <p className={`text-sm mt-1 ${subtext}`}>{posts.length} total · posts you publish appear on the public website</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] hover:opacity-90 shadow-lg shadow-[#2F8F89]/20"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtext}`} />
          <input
            type="text" placeholder="Search posts…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "published", "draft", "archived"] as StatusFilter[]).map((s) => {
            const active = filter === s;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                  active
                    ? isLight ? "bg-[#2F8F89]/10 text-[#2F8F89] border border-[#2F8F89]/25" : "bg-[#2F8F89]/15 text-[#3FE0D0] border border-[#2F8F89]/30"
                    : isLight ? "bg-black/[0.03] text-black/40 border border-black/[0.08] hover:text-black" : "bg-white/5 text-white/40 border border-white/10 hover:text-white"
                }`}
              >
                {s} <span className="ml-1 opacity-60">({counts[s]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${subtext}`}>No posts found.</div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${divider}`}>
                  {["Post", "Category", "Status", "Author", "Date", "Actions"].map((h) => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${subtext}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sm = STATUS_META[p.status];
                  const StatusIcon = sm.icon;
                  const statusCls = isLight ? sm.light : sm.dark;
                  return (
                    <tr key={p.id} className={`border-b last:border-0 transition-colors ${divider} ${rowHover}`}>
                      <td className="px-4 py-4 pl-6 max-w-xs">
                        <p className={`text-sm font-semibold truncate ${heading}`}>{p.title}</p>
                        <p className={`text-xs truncate mt-0.5 ${subtext}`}>{p.excerpt ?? "No excerpt"}</p>
                        <p className={`text-[10px] mt-0.5 font-mono ${subtext} opacity-60`}>{readingTime(p.content)} min read</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${isLight ? "bg-black/[0.04] text-black/50 border-black/10" : "bg-white/5 text-white/40 border-white/10"}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCls}`}>
                          <StatusIcon className="w-3 h-3" />{sm.label}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${subtext}`}>{p.author_name}</td>
                      <td className={`px-4 py-4 text-sm ${subtext}`}>
                        {formatDate(p.published_at ?? p.created_at)}
                      </td>
                      <td className="px-4 py-4 pr-6">
                        <div className="flex items-center gap-1">
                          {/* Toggle publish */}
                          <button
                            onClick={() => toggleStatus(p)}
                            title={p.status === "published" ? "Unpublish" : "Publish"}
                            className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/35 hover:text-[#2F8F89] hover:bg-[#2F8F89]/08" : "text-white/30 hover:text-[#3FE0D0] hover:bg-[#3FE0D0]/08"}`}
                          >
                            {p.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(p)}
                            className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/35 hover:text-black hover:bg-black/[0.06]" : "text-white/30 hover:text-white hover:bg-white/[0.06]"}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* View live (published only) */}
                          {p.status === "published" && (
                            <a
                              href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"
                              className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/35 hover:text-black hover:bg-black/[0.06]" : "text-white/30 hover:text-white hover:bg-white/[0.06]"}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${isLight ? "text-black/25 hover:text-red-500 hover:bg-red-50" : "text-white/20 hover:text-red-400 hover:bg-red-400/08"}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col ${isLight ? "bg-white" : "bg-[#111113] border border-white/[0.08]"}`}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isLight ? "border-black/[0.07]" : "border-white/[0.06]"}`}>
              <h3 className={`text-base font-bold ${heading}`}>{editPost ? "Edit Post" : "New Blog Post"}</h3>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl transition-all ${isLight ? "text-black/35 hover:bg-black/[0.06]" : "text-white/30 hover:bg-white/[0.06]"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSave} className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[80vh]">
              {/* Title */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Title *</label>
                <input
                  type="text" required placeholder="Enter post title…"
                  value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                />
              </div>

              {/* Slug */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>URL Slug</label>
                <input
                  type="text" placeholder="auto-generated-from-title"
                  value={form.slug}
                  onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                />
                <p className={`text-[10px] mt-1 ${subtext} opacity-70`}>Public URL: /blog/{form.slug || toSlug(form.title) || "your-post-slug"}</p>
              </div>

              {/* Category + Author row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Category</label>
                  <select
                    value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  >
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Author</label>
                  <input
                    type="text" placeholder="Deluxify Team"
                    value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Excerpt <span className="opacity-50 font-normal">(shown on listing page)</span></label>
                <textarea
                  rows={2} placeholder="A short summary of what this post is about…"
                  value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${inputCls}`}
                />
              </div>

              {/* Content */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Content * <span className="opacity-50 font-normal">(separate paragraphs with a blank line)</span></label>
                <textarea
                  rows={12} required placeholder="Write your post content here. Separate paragraphs with a blank line.

Each double line break creates a new paragraph on the published page."
                  value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-y font-mono leading-relaxed ${inputCls}`}
                />
                {form.content && (
                  <p className={`text-[10px] mt-1 ${subtext} opacity-70`}>~{readingTime(form.content)} min read · {form.content.split(/\s+/).filter(Boolean).length} words</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Tags <span className="opacity-50 font-normal">(comma-separated)</span></label>
                <input
                  type="text" placeholder="AI, Automation, Business"
                  value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                />
              </div>

              {/* Cover image URL */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Cover Image URL <span className="opacity-50 font-normal">(optional)</span></label>
                <input
                  type="url" placeholder="https://…"
                  value={form.cover_image} onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                />
              </div>

              {/* Status */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${subtext}`}>Status</label>
                <div className="flex gap-2">
                  {(["draft", "published", "archived"] as const).map((s) => {
                    const sm = STATUS_META[s];
                    const StatusIcon = sm.icon;
                    const sel = form.status === s;
                    return (
                      <button
                        key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          sel
                            ? isLight ? sm.light : sm.dark
                            : isLight ? "border-black/10 text-black/35 hover:text-black" : "border-white/10 text-white/30 hover:text-white"
                        }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />{sm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-3 pt-2 border-t ${isLight ? "border-black/[0.07]" : "border-white/[0.06]"}`}>
                <button type="button" onClick={() => setShowModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isLight ? "bg-black/[0.04] text-black/50 hover:bg-black/[0.08]" : "bg-white/5 text-white/40 hover:bg-white/[0.08]"}`}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editPost ? "Save Changes" : form.status === "published" ? "Publish Post" : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
