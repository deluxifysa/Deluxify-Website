"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function StaffLogin() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push("/staff/dashboard");
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isLight ? "bg-[#F4F4F5]" : "bg-[#0B0B0C]"
      }`}
    >
      {/* Back button */}
      <Link
        href="/"
        className={`fixed top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
          isLight
            ? "text-black/40 hover:text-black hover:bg-black/[0.06]"
            : "text-white/40 hover:text-white hover:bg-white/[0.08]"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-medium">Back to site</span>
      </Link>

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(isLight ? "dark" : "light")}
          className={`fixed top-4 right-4 p-2 rounded-xl transition-all ${
            isLight
              ? "text-black/40 hover:text-black hover:bg-black/[0.06]"
              : "text-white/40 hover:text-white hover:bg-white/[0.08]"
          }`}
          aria-label="Toggle theme"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Deluxify"
            width={120}
            height={36}
            className={`h-9 w-auto mx-auto mb-5 ${
              isLight ? "brightness-0" : "brightness-0 invert"
            }`}
          />
          <h1 className={`text-2xl font-bold ${isLight ? "text-black" : "text-white"}`}>
            Staff Portal
          </h1>
          <p className={`text-sm mt-1 ${isLight ? "text-black/40" : "text-white/40"}`}>
            Sign in to access your workspace
          </p>
        </div>

        <div
          className={`p-6 sm:p-8 rounded-2xl border ${
            isLight
              ? "bg-white border-black/[0.08] shadow-sm"
              : "glass-card gradient-border"
          }`}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isLight ? "text-black/40" : "text-white/40"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@deluxify.ai"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F89] focus:border-transparent transition-all ${
                  isLight
                    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/30"
                    : "bg-white/5 border border-white/10 text-white placeholder:text-white/25"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isLight ? "text-black/40" : "text-white/40"
                }`}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F89] focus:border-transparent transition-all ${
                  isLight
                    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/30"
                    : "bg-white/5 border border-white/10 text-white placeholder:text-white/25"
                }`}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p
          className={`text-center text-xs mt-6 ${
            isLight ? "text-black/25" : "text-white/20"
          }`}
        >
          Staff access only. Contact your administrator if you need an account.
        </p>
      </div>
    </div>
  );
}
