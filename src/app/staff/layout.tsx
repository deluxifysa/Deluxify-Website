"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Users, Target, FolderKanban, Calendar,
  Package, TrendingUp, FileText, Layers, Shield,
  LogOut, Menu, X, Sun, Moon, Bell, Search,
  ChevronRight, BarChart3, RefreshCcw, List, CalendarDays, BookOpen,
} from "lucide-react";

type NavChild = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavItem  = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; soon?: boolean; adminOnly?: boolean; children?: NavChild[] };
type NavGroup = { label: string | null; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/staff/crm",           label: "Clients",       icon: Users },
      { href: "/staff/pipeline",      label: "Pipeline",      icon: Target },
      { href: "/staff/invoices",      label: "Invoices",      icon: FileText },
      { href: "/staff/subscriptions", label: "Subscriptions", icon: RefreshCcw },
      { href: "/staff/revenue",       label: "Revenue",       icon: TrendingUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/staff/projects", label: "Projects", icon: FolderKanban },
      {
        href: "/staff/bookings",
        label: "Bookings",
        icon: Calendar,
        children: [
          { href: "/staff/bookings",          label: "List View",     icon: List },
          { href: "/staff/bookings/calendar", label: "Calendar View", icon: CalendarDays },
        ],
      },
      { href: "/staff/services", label: "Services", icon: Package },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/staff/blog",    label: "Blog",    icon: BookOpen },
      { href: "/staff/content", label: "Social",  icon: Layers, soon: true },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/staff/team",    label: "Team",    icon: Shield },
      { href: "/staff/reports", label: "Reports", icon: BarChart3, adminOnly: true },
    ],
  },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [user,        setUser]        = useState<User | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [showBell,    setShowBell]    = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin,     setIsAdmin]     = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session && pathname !== "/staff/login") {
        router.push("/staff/login");
        setLoading(false);
        return;
      }
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser?.email) {
        const { data: member } = await supabase
          .from("team_members")
          .select("role")
          .eq("email", sessionUser.email)
          .maybeSingle();
        setIsAdmin(!member || member.role === "admin");
      } else {
        setIsAdmin(true); // no team record = portal owner
      }
      setLoading(false);
    });
  }, [pathname, router]);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler() {
      if (showBell) setShowBell(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBell]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/staff/login");
  }

  const isLight = mounted && theme === "light";

  if (pathname === "/staff/login") return <>{children}</>;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-[#F4F4F5]" : "bg-[#0B0B0C]"}`}>
        <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const displayName = user.user_metadata?.first_name || user.email?.split("@")[0] || "Staff";

  // Current page label — check children first for more specific matches
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const allChildren = allItems.flatMap((i) => i.children ?? []);
  const currentLabel =
    allChildren.find((c) => pathname === c.href)?.label ??
    allItems.find((i) => i.href !== "/staff/dashboard" ? pathname.startsWith(i.href) : pathname === i.href)?.label ??
    "Staff Portal";

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isLight ? "bg-[#F4F4F5]" : "bg-[#0B0B0C]"}`}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-all duration-300 border-r ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 ${isLight ? "bg-white border-black/[0.07]" : "bg-[#0D0D0F] border-white/[0.06]"}`}>

        {/* Logo */}
        <div className={`flex items-center gap-2 px-5 h-14 border-b flex-shrink-0 ${isLight ? "border-black/[0.07]" : "border-white/[0.06]"}`}>
          <Image
            src="/logo.png"
            alt="Deluxify"
            width={90}
            height={28}
            className={`h-6 w-auto ${isLight ? "brightness-0" : "brightness-0 invert"}`}
          />
          <span className={`text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded ${
            isLight ? "bg-black/[0.06] text-black/40" : "bg-white/[0.06] text-white/30"
          }`}>CRM</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className={`px-3 mb-1 text-[10px] font-bold uppercase tracking-widest ${
                  isLight ? "text-black/20" : "text-white/15"
                }`}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.filter((item) => !item.adminOnly || isAdmin).map((item) => {
                  const isParentActive = item.href !== "/staff/dashboard"
                    ? pathname.startsWith(item.href)
                    : pathname === item.href;
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                          isParentActive
                            ? isLight
                              ? "bg-[#2F8F89]/10 text-[#2F8F89]"
                              : "bg-[#2F8F89]/15 text-[#3FE0D0]"
                            : isLight
                            ? "text-black/50 hover:text-black hover:bg-black/[0.04]"
                            : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.soon
                          ? <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${isLight ? "bg-black/[0.07] text-black/35" : "bg-white/[0.07] text-white/30"}`}>Soon</span>
                          : isParentActive && !hasChildren && <ChevronRight className="w-3 h-3 opacity-60" />
                        }
                      </Link>
                      {/* Sub-nav children — only shown when parent is active */}
                      {hasChildren && isParentActive && (
                        <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l-2 border-[#2F8F89]/30">
                          {item.children!.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  childActive
                                    ? isLight
                                      ? "text-[#2F8F89] bg-[#2F8F89]/08"
                                      : "text-[#3FE0D0] bg-[#3FE0D0]/08"
                                    : isLight
                                    ? "text-black/40 hover:text-black hover:bg-black/[0.04]"
                                    : "text-white/35 hover:text-white hover:bg-white/[0.05]"
                                }`}
                              >
                                <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={`p-3 border-t flex-shrink-0 ${isLight ? "border-black/[0.07]" : "border-white/[0.06]"}`}>
          <Link
            href="/staff/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-1 transition-all ${
              isLight ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.05]"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isLight ? "bg-[#2F8F89]/15 text-[#2F8F89]" : "bg-[#2F8F89]/20 text-[#3FE0D0]"
            }`}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${isLight ? "text-black/80" : "text-white/70"}`}>{displayName}</p>
              <p className={`text-[10px] truncate ${isLight ? "text-black/35" : "text-white/25"}`}>{user.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
              isLight ? "text-black/35 hover:text-black hover:bg-black/[0.04]" : "text-white/30 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className={`h-14 border-b flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-10 backdrop-blur transition-colors duration-300 ${
          isLight ? "bg-white/90 border-black/[0.07]" : "bg-[#0D0D0F]/80 border-white/[0.06]"
        }`}>

          <button className={`lg:hidden transition-colors ${isLight ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <span className={`text-sm font-semibold flex-1 min-w-0 truncate ${isLight ? "text-black/60" : "text-white/50"}`}>
            {currentLabel}
          </span>

          {/* Search */}
          {showSearch ? (
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? "text-black/30" : "text-white/25"}`} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search clients, projects, invoices…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2F8F89] transition-all ${
                    isLight
                      ? "bg-black/[0.05] border border-black/10 text-black placeholder:text-black/30"
                      : "bg-white/[0.07] border border-white/10 text-white placeholder:text-white/25"
                  }`}
                />
              </div>
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                className={`transition-colors ${isLight ? "text-black/35 hover:text-black" : "text-white/35 hover:text-white"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className={`p-2 rounded-xl transition-all ${isLight ? "text-black/35 hover:text-black hover:bg-black/[0.04]" : "text-white/35 hover:text-white hover:bg-white/[0.06]"}`}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowBell(!showBell)}
              className={`p-2 rounded-xl transition-all ${isLight ? "text-black/35 hover:text-black hover:bg-black/[0.04]" : "text-white/35 hover:text-white hover:bg-white/[0.06]"}`}
            >
              <Bell className="w-4 h-4" />
            </button>
            {showBell && (
              <div className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border shadow-xl z-50 overflow-hidden ${
                isLight ? "bg-white border-black/[0.08]" : "bg-[#111113] border-white/[0.08]"
              }`}>
                <div className={`px-4 py-3 border-b ${isLight ? "border-black/[0.07]" : "border-white/[0.06]"}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/30"}`}>Notifications</p>
                </div>
                <div className="p-6 text-center">
                  <Bell className={`w-8 h-8 mx-auto mb-2 ${isLight ? "text-black/15" : "text-white/10"}`} />
                  <p className={`text-sm font-medium ${isLight ? "text-black/50" : "text-white/40"}`}>All caught up</p>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-black/30" : "text-white/25"}`}>No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className={`p-2 rounded-xl transition-all ${isLight ? "text-black/35 hover:text-black hover:bg-black/[0.04]" : "text-white/35 hover:text-white hover:bg-white/[0.06]"}`}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          )}
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
