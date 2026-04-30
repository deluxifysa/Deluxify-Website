"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Clock, Tag } from "lucide-react";
import type { BlogPost } from "@/types/crm";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "AI Insights":     "from-[#2F8F89]/80 to-[#1a5c58]/60",
  "AI News":         "from-[#3B82F6]/80 to-[#1d4ed8]/60",
  "Industry Trends": "from-[#8B5CF6]/80 to-[#6d28d9]/60",
  "Tutorial":        "from-[#F59E0B]/80 to-[#b45309]/60",
  "Case Study":      "from-[#10B981]/80 to-[#047857]/60",
  "Company":         "from-[#EC4899]/80 to-[#be185d]/60",
};

const CATEGORY_BADGE: Record<string, string> = {
  "AI Insights":     "bg-[#2F8F89]/15 text-[#2F8F89] border-[#2F8F89]/30",
  "AI News":         "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Industry Trends": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Tutorial":        "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Case Study":      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Company":         "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, []);

  const isLight = mounted && theme === "light";

  // Theme tokens
  const pageBg    = isLight ? "bg-[#F4F4F5]"    : "bg-[#0B0B0C]";
  const heading   = isLight ? "text-black"       : "text-white";
  const subtext   = isLight ? "text-black/50"    : "text-white/50";
  const muted     = isLight ? "text-black/35"    : "text-white/35";
  const cardBg    = isLight ? "bg-white border-black/[0.08] shadow-sm" : "bg-[#111113] border-white/[0.07]";
  const cardHover = isLight ? "hover:border-black/20 hover:shadow-md" : "hover:border-white/15";
  const divider   = isLight ? "border-black/[0.07]" : "border-white/[0.07]";

  return (
    <main className={`min-h-screen transition-colors duration-300 ${pageBg}`}>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#2F8F89]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-[#2F8F89]/30 bg-[#2F8F89]/10 text-[#2F8F89] mb-5">
              <Tag className="w-3 h-3" /> Insights & AI News
            </span>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 ${heading}`}>
              The Deluxify{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F8F89] to-[#3FE0D0]">Blog</span>
            </h1>
            <p className={`text-lg max-w-xl mx-auto ${subtext}`}>
              Practical insights on AI, automation, and what they mean for your business — written by the team building it every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className={`text-center py-24 text-sm ${muted}`}>No posts published yet.</p>
        ) : (
          <>
            {/* Featured post */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <Link
                href={`/blog/${posts[0].slug}`}
                className={`group block rounded-3xl overflow-hidden border transition-all duration-300 ${cardBg} ${cardHover}`}
              >
                {/* Image / gradient banner */}
                <div className={`h-48 sm:h-64 w-full relative overflow-hidden ${
                  posts[0].cover_image ? "" : `bg-gradient-to-br ${CATEGORY_GRADIENTS[posts[0].category] ?? "from-[#2F8F89]/80 to-[#1a5c58]/60"}`
                }`}>
                  {posts[0].cover_image && (
                    <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-6">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-black/40 text-white border-white/20">
                      {posts[0].category}
                    </span>
                  </div>
                  <div className="absolute top-5 right-6">
                    <span className="text-[11px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full">Featured</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h2 className={`text-xl sm:text-2xl font-bold group-hover:text-[#2F8F89] transition-colors duration-200 leading-snug mb-3 ${heading}`}>
                    {posts[0].title}
                  </h2>
                  <p className={`text-sm leading-relaxed mb-5 line-clamp-2 ${subtext}`}>{posts[0].excerpt}</p>
                  <div className={`flex items-center justify-between border-t pt-4 ${divider}`}>
                    <div className={`flex items-center gap-4 text-xs ${muted}`}>
                      <span>{posts[0].author_name}</span>
                      <span>·</span>
                      <span>{formatDate(posts[0].published_at ?? posts[0].created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{readingTime(posts[0].content)} min read
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2F8F89] group-hover:gap-3 transition-all duration-200">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Grid */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 ${cardBg} ${cardHover}`}
                    >
                      {/* Thumbnail */}
                      <div className={`h-40 w-full relative overflow-hidden flex-shrink-0 ${
                        post.cover_image ? "" : `bg-gradient-to-br ${CATEGORY_GRADIENTS[post.category] ?? "from-[#2F8F89]/80 to-[#1a5c58]/60"}`
                      }`}>
                        {post.cover_image && (
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_BADGE[post.category] ?? "bg-white/10 text-white border-white/20"}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className={`text-sm font-bold group-hover:text-[#2F8F89] transition-colors duration-200 leading-snug mb-2 line-clamp-3 ${heading}`}>
                          {post.title}
                        </h3>
                        <p className={`text-xs leading-relaxed line-clamp-2 mb-4 flex-1 ${subtext}`}>
                          {post.excerpt}
                        </p>
                        <div className={`flex items-center justify-between pt-3 border-t ${divider}`}>
                          <div className={`flex items-center gap-2 text-[10px] ${muted}`}>
                            <span>{formatDate(post.published_at ?? post.created_at)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{readingTime(post.content)}m
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#2F8F89] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
