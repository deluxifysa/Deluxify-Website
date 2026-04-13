"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";

type ConsentState = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "deluxify_cookie_consent";

function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<Omit<ConsentState, "necessary">>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = loadConsent();
    if (!stored) {
      // Slight delay so the banner slides in after page paints
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function acceptAll() {
    const consent: ConsentState = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(consent);
    setVisible(false);
  }

  function rejectAll() {
    const consent: ConsentState = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(consent);
    setVisible(false);
  }

  function saveCustom() {
    const consent: ConsentState = { necessary: true, ...prefs };
    saveConsent(consent);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-2xl"
    >
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-5 text-sm text-white/80">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
            <Cookie className="h-4 w-4 text-white/70" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white mb-1">We use cookies</p>
            <p className="text-white/60 text-xs leading-relaxed">
              We use cookies to improve your experience, analyse traffic, and personalise content.
              By clicking <strong className="text-white/80">Accept All</strong> you consent to our use of all cookies.{" "}
              <Link href="/cookies" className="underline underline-offset-2 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </p>
          </div>
          <button
            onClick={rejectAll}
            className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss and reject non-essential cookies"
          >
            <X className="h-4 w-4 text-white/50" />
          </button>
        </div>

        {/* Customise panel */}
        {expanded && (
          <div className="mb-4 space-y-2 border-t border-white/[0.08] pt-4">
            {[
              {
                key: "necessary" as const,
                label: "Strictly Necessary",
                desc: "Required for the site to function. Cannot be disabled.",
                locked: true,
                value: true,
              },
              {
                key: "functional" as const,
                label: "Functional",
                desc: "Remembers your preferences like theme and region.",
                locked: false,
                value: prefs.functional,
              },
              {
                key: "analytics" as const,
                label: "Analytics & Performance",
                desc: "Helps us understand how visitors interact with the site.",
                locked: false,
                value: prefs.analytics,
              },
              {
                key: "marketing" as const,
                label: "Marketing & Targeting",
                desc: "Used to show relevant ads on other platforms.",
                locked: false,
                value: prefs.marketing,
              },
            ].map((cat) => (
              <div
                key={cat.key}
                className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02]"
              >
                <div>
                  <p className="text-white/90 font-medium text-xs">{cat.label}</p>
                  <p className="text-white/40 text-[11px] mt-0.5">{cat.desc}</p>
                </div>
                <button
                  disabled={cat.locked}
                  aria-checked={cat.value}
                  role="switch"
                  onClick={() =>
                    !cat.locked &&
                    setPrefs((p) => ({ ...p, [cat.key]: !p[cat.key as keyof typeof p] }))
                  }
                  className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    cat.value
                      ? "bg-white/90"
                      : "bg-white/20"
                  } ${cat.locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-[#0a0a0a] shadow transition-transform ${
                      cat.value ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide options" : "Customise"}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={expanded ? saveCustom : rejectAll}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
            >
              {expanded ? "Save preferences" : "Reject non-essential"}
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-black hover:bg-white/90 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
