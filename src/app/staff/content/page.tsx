"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getThemeTokens } from "@/lib/crm-utils";
import { Layers } from "lucide-react";

export default function ContentPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className={`text-2xl font-bold ${t.heading}`}>Content</h1>
        <p className={`text-sm mt-0.5 ${t.subtext}`}>Social media scheduling and content management</p>
      </div>

      <div className={`rounded-2xl p-20 flex flex-col items-center justify-center text-center ${t.card}`}>
        <Layers className={`w-10 h-10 mb-4 ${t.subtext}`} />
        <p className={`text-lg font-semibold mb-2 ${t.heading}`}>Coming Soon</p>
        <p className={`text-sm ${t.subtext}`}>Content scheduling and social media management is on the way.</p>
      </div>
    </div>
  );
}
