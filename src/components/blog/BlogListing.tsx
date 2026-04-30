"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  "AI Insights":     "bg-[#3FE0D0]/15 text-[#3FE0D0] border-[#3FE0D0]/25",
  "AI News":         "bg-blue-400/15 text-blue-400 border-blue-400/25",
  "Industry Trends": "bg-purple-400/15 text-purple-400 border-purple-400/25",
  "Business":        "bg-yellow-400/15 text-yellow-400 border-yellow-400/25",
  "Case Study":      "bg-green-400/15 text-green-400 border-green-400/25",
  "Company News":    "bg-orange-400/15 text-orange-400 border-orange-400/25",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-white/10 text-white/60 border-white/15";
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 ${
        featured ? "md:flex-row" : ""
      }`}
    >
      {/* Cover */}
      <div className={`relative overflow-hidden flex-shrink-0 ${featured ? "md:w-1/2 h-56 md:h-auto" : "h-48"}`}>
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2F8F89]/30 to-[#3B82F6]/20 flex items-center justify-center">
            <span className="text-4xl opacity-30">✦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColor(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-6 ${featured ? "md:p-8 md:justify-center" : ""}`}>
        <h2 className={`font-bold text-white leading-snug group-hover:text-[#3FE0D0] transition-colors ${featured ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2"}`}>
          {post.title}
        </h2>
        {post.excerpt && (
          <p className={`text-white/55 leading-relaxed ${featured ? "text-base mb-6 line-clamp-3" : "text-sm mb-4 line-clamp-2"}`}>
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-white/35 mt-auto">
          <span className="font-medium text-white/50">{post.author_name}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(post.published_at ?? post.created_at)}
          </span>
          {post.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min read
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-[#3FE0D0] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogListing() {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeCategory, setActive] = useState("All");

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,cover_image,author_name,category,tags,reading_time,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered   = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <section className="min-h-screen bg-[#0B0B0C] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3FE0D0]/20 bg-[#3FE0D0]/8 text-[#3FE0D0] text-xs font-semibold uppercase tracking-widest mb-6">
            <Tag className="w-3 h-3" /> Insights & AI News
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-5">
            The AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F8F89] to-[#3B82F6]">Pulse</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Perspectives on AI automation, industry shifts, and building competitive advantage in the age of intelligent systems.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#2F8F89] text-white shadow-lg shadow-[#2F8F89]/25"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#3FE0D0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">No posts in this category yet.</div>
        ) : (
          <div className="space-y-6">
            {/* Featured */}
            {featured && <PostCard post={featured} featured />}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((p) => <PostCard key={p.id} post={p} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
