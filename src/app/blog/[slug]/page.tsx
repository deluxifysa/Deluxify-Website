"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Calendar, User, Tag } from "lucide-react";
import type { BlogPost } from "@/types/crm";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "AI Insights":     "from-[#2F8F89] to-[#1a5c58]",
  "AI News":         "from-[#3B82F6] to-[#1d4ed8]",
  "Industry Trends": "from-[#8B5CF6] to-[#6d28d9]",
  "Tutorial":        "from-[#F59E0B] to-[#b45309]",
  "Case Study":      "from-[#10B981] to-[#047857]",
  "Company":         "from-[#EC4899] to-[#be185d]",
};

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function isHeading(para: string): boolean {
  return para.length < 80 && !para.endsWith(".") && !para.endsWith(",") && !para.includes("\n");
}

export default function BlogPostPage() {
  const { slug }  = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const [mounted,  setMounted]  = useState(false);
  const [post,     setPost]     = useState<BlogPost | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setPost(data);
        setLoading(false);
      });
  }, [slug]);

  const isLight = mounted && theme === "light";

  // Theme tokens
  const pageBg  = isLight ? "bg-[#F4F4F5]"    : "bg-[#0B0B0C]";
  const heading = isLight ? "text-black"       : "text-white";
  const subtext = isLight ? "text-black/55"    : "text-white/60";
  const muted   = isLight ? "text-black/35"    : "text-white/35";
  const body    = isLight ? "text-black/70"    : "text-white/70";
  const divider = isLight ? "border-black/[0.08]" : "border-white/[0.07]";
  const tagBg   = isLight ? "bg-black/[0.05] border-black/[0.08] text-black/50" : "bg-white/[0.05] border-white/[0.08] text-white/40";
  const ctaBg   = isLight ? "bg-white border-t border-black/[0.07]" : "bg-[#0D1F1D] border-t border-[#2F8F89]/20";

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className="w-8 h-8 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${pageBg} ${muted}`}>
        <p className="text-lg">Post not found.</p>
        <Link href="/blog" className="text-[#2F8F89] text-sm hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  const blocks    = post.content.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const gradient  = CATEGORY_GRADIENTS[post.category] ?? "from-[#2F8F89] to-[#1a5c58]";

  return (
    <main className={`min-h-screen transition-colors duration-300 ${pageBg}`}>

      {/* Hero banner — always uses the gradient + optional cover image */}
      <div className={`relative bg-gradient-to-br ${gradient} pt-32 pb-16 px-4 overflow-hidden`}>
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-4 bg-white/10 text-white border-white/25">
              <Tag className="w-3 h-3" /> {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author_name}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(post.published_at ?? post.created_at)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readingTime(post.content)} min read</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className={`text-lg leading-relaxed mb-10 pb-10 border-b font-medium italic ${subtext} ${divider}`}
          >
            {post.excerpt}
          </motion.p>
        )}

        <div className="space-y-5">
          {blocks.map((para, i) =>
            isHeading(para) ? (
              <motion.h2
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className={`text-lg font-bold mt-8 mb-1 ${heading}`}
              >
                {para}
              </motion.h2>
            ) : (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className={`leading-[1.85] text-[15px] ${body}`}
              >
                {para}
              </motion.p>
            )
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className={`mt-12 pt-8 border-t ${divider}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${muted}`}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border ${tagBg}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* CTA */}
      <section className={`py-16 px-4 text-center ${ctaBg}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2F8F89] mb-3">Ready to Apply This?</p>
        <h2 className={`text-2xl sm:text-3xl font-bold mb-4 max-w-xl mx-auto ${heading}`}>
          Let Deluxify build the AI systems your business needs
        </h2>
        <p className={`text-sm mb-8 max-w-md mx-auto ${subtext}`}>
          From AI agents to full automation workflows — we turn insights like these into working systems for your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/book-call"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(47,143,137,0.3)]"
          >
            Book a Free Call
          </Link>
          <Link
            href="/blog"
            className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
              isLight
                ? "border-black/10 text-black/50 hover:text-black hover:border-black/20"
                : "border-white/[0.08] text-white/60 hover:text-white hover:border-white/20"
            }`}
          >
            More Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
