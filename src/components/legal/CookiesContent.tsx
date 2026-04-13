"use client";

import { LegalPage } from "./LegalPage";

const sections = [
  {
    heading: "What Are Cookies?",
    content: (
      <p>Cookies are small text files placed on your device when you visit a website. They allow the website to remember your actions and preferences over time. Cookies are widely used to make websites work more efficiently and to provide information to site owners.</p>
    ),
  },
  {
    heading: "Legal Basis — POPIA & ECTA",
    content: (
      <>
        <p>In South Africa, cookies that collect personal information are regulated under the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong> and the <strong>Electronic Communications and Transactions Act 25 of 2002 (ECTA)</strong>.</p>
        <p>Under Section 18 of POPIA, we are required to inform you of our data processing activities. For non-essential cookies (analytics, marketing), we require your <strong>explicit consent</strong> before placing them on your device. You may withdraw consent at any time.</p>
      </>
    ),
  },
  {
    heading: "Categories of Cookies We Use",
    content: (
      <div className="space-y-4">
        {[
          {
            name: "Strictly Necessary Cookies",
            note: "Always active — cannot be disabled",
            desc: "These cookies are essential for the website to function. They include session management, security tokens, and load balancing. Without them, services such as booking a call cannot be provided.",
          },
          {
            name: "Functional Cookies",
            note: "Require consent",
            desc: "These cookies remember your preferences such as language, theme (dark/light mode), and region. They improve your experience but are not essential.",
          },
          {
            name: "Analytics & Performance Cookies",
            note: "Require consent",
            desc: "These cookies collect anonymous information about how visitors interact with our website — pages visited, time on page, and referral sources. Providers may include Google Analytics and Vercel Analytics.",
          },
          {
            name: "Marketing & Targeting Cookies",
            note: "Require explicit consent",
            desc: "These cookies track your browsing activity to show you relevant advertising on other platforms (LinkedIn, Meta). We only activate these cookies with your explicit opt-in consent.",
          },
        ].map((cat) => (
          <div key={cat.name} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="font-semibold mb-0.5">{cat.name}</p>
            <p className="text-xs opacity-50 mb-2">{cat.note}</p>
            <p>{cat.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    heading: "Cookies We Specifically Use",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-4 font-semibold opacity-60">Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold opacity-60">Provider</th>
              <th className="text-left py-2 pr-4 font-semibold opacity-60">Purpose</th>
              <th className="text-left py-2 font-semibold opacity-60">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {[
              ["theme", "Deluxify", "Stores dark/light mode preference", "1 year"],
              ["_ga", "Google Analytics", "Distinguishes unique users", "2 years"],
              ["_gid", "Google Analytics", "Stores pageview data", "24 hours"],
              ["_fbp", "Meta", "Ad conversion tracking (opt-in only)", "3 months"],
              ["li_fat_id", "LinkedIn", "Ad conversion tracking (opt-in only)", "30 days"],
              ["session", "Deluxify", "Maintains your active session", "Session"],
            ].map(([name, provider, purpose, duration]) => (
              <tr key={name}>
                <td className="py-2 pr-4 font-mono">{name}</td>
                <td className="py-2 pr-4">{provider}</td>
                <td className="py-2 pr-4">{purpose}</td>
                <td className="py-2">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    heading: "Third-Party Cookies",
    content: (
      <p>Some cookies are placed by third-party services (Google, Meta, LinkedIn). We do not control these cookies. We only activate third-party non-essential cookies with your consent. Please review the privacy policies of these third parties directly.</p>
    ),
  },
  {
    heading: "How to Manage & Withdraw Consent",
    content: (
      <>
        <p>You have full control over cookies:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Cookie banner:</strong> Accept or reject non-essential cookies when you first visit our site</li>
          <li><strong>Browser settings:</strong> View, block, and delete cookies via your browser settings menu</li>
          <li><strong>Google Analytics opt-out:</strong> Install the Google Analytics Opt-out Browser Add-on</li>
          <li><strong>Withdraw consent:</strong> Email <a href="mailto:privacy@deluxify.co.za" className="underline">privacy@deluxify.co.za</a> to request removal of your cookie data</li>
        </ul>
        <p className="mt-2">Disabling strictly necessary cookies may affect the functionality of our website, including booking forms and contact features.</p>
      </>
    ),
  },
  {
    heading: "Cross-Border Data Transfers",
    content: (
      <p>Some third-party cookie providers (e.g. Google) may process data outside South Africa. Where this occurs, we ensure appropriate safeguards are in place in compliance with <strong>Section 72 of POPIA</strong>, which requires that the recipient provides adequate protection for personal information.</p>
    ),
  },
  {
    heading: "Your Rights",
    content: (
      <p>Under POPIA, you have the right to know what personal information is collected via cookies, to access it, request its correction or deletion, and to lodge a complaint with the <strong>Information Regulator of South Africa</strong> at <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="underline">inforegulator.org.za</a> if you believe your rights have been violated.</p>
    ),
  },
  {
    heading: "Changes to This Cookie Policy",
    content: (
      <p>We may update this Cookie Policy as our services change or as legal requirements evolve. The most current version will always be available on this page. Continued use of our website after updates constitutes acceptance of the revised policy.</p>
    ),
  },
];

export function CookiesContent() {
  return (
    <LegalPage
      badge="Legal"
      title="Cookie Policy"
      subtitle="This policy explains what cookies Deluxify uses, why we use them, and how you can control them — in full compliance with POPIA and ECTA."
      lastUpdated="1 April 2026"
      sections={sections}
    />
  );
}
