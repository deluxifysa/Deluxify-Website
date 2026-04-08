"use client";

import {
  Brain, Bot, Zap, Globe, Smartphone, Layers, Palette,
  Search, Share2, GraduationCap, Server, Film, ShoppingBag,
  CheckCircle2, TrendingUp, Clock, DollarSign,
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import BorderGlow from "@/components/ui/BorderGlow";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const categoryGlowConfig: Record<string, { colors: string[]; glowColor: string }> = {
  "ai-strategy":   { colors: ["#2F8F89", "#3FE0D0", "#1F6F6A"], glowColor: "170 60 55" },
  "development":   { colors: ["#3B82F6", "#60A5FA", "#2563EB"], glowColor: "220 90 60" },
  "marketing":     { colors: ["#10B981", "#34D399", "#059669"], glowColor: "160 70 55" },
  "infrastructure":{ colors: ["#F97316", "#FB923C", "#EA580C"], glowColor: "25 90 60" },
};

const lightGlow = { colors: ["#555555", "#333333", "#111111"], glowColor: "0 0 20" };

const categories = [
  {
    id: "ai-strategy",
    label: "AI & Strategy",
    color: "from-[#2F8F89] to-[#1F6F6A]",
    services: [
      {
        id: "ai-strategy-service",
        icon: Brain,
        title: "AI Strategy & Consulting",
        subtitle: "Clarity before commitment.",
        description:
          "Before writing a line of code, we map your business, identify your highest-ROI automation opportunities, and build a phased roadmap that fits your budget and timeline. No guesswork. just a clear, confident path to AI adoption.",
        outcomes: [
          { icon: Clock, value: "30 days", desc: "Time to first measurable result" },
          { icon: TrendingUp, value: "3–40x", desc: "Average ROI range across clients" },
          { icon: DollarSign, value: "100%", desc: "Clear projections before you commit" },
        ],
        features: [
          "AI readiness assessment",
          "Custom opportunity mapping",
          "90-day implementation roadmap",
          "Technology selection guidance",
          "Team AI upskilling plan",
          "Ongoing quarterly strategy reviews",
        ],
      },
      {
        id: "ai-automation",
        icon: Zap,
        title: "AI Automation",
        subtitle: "Eliminate the work that's holding you back.",
        description:
          "We identify the manual, repetitive processes that drain your team's time and replace them with intelligent, self-running workflows. email triage, invoicing, reporting, lead capture, onboarding, and more. Your team gets their time back.",
        outcomes: [
          { icon: Clock, value: "2,000+ hrs", desc: "Average hours reclaimed per year" },
          { icon: TrendingUp, value: "340%", desc: "Average process efficiency gain" },
          { icon: DollarSign, value: "45–65%", desc: "Reduction in operational overhead" },
        ],
        features: [
          "Email triage, drafting, and routing",
          "Invoice processing and reconciliation",
          "Automated reporting and data pipelines",
          "Lead capture and CRM population",
          "HR onboarding document management",
          "Multi-step approval workflow automation",
          "Inventory monitoring and reorder alerts",
        ],
      },
      {
        id: "chatbots",
        icon: Bot,
        title: "AI Chatbots & Virtual Agents",
        subtitle: "24/7 customer engagement that converts.",
        description:
          "Modern customers expect instant answers at any hour. Our AI chatbots understand natural language, handle complex conversations, and are trained on your specific business, products, and brand voice. deployed across web, WhatsApp, and social channels.",
        outcomes: [
          { icon: Clock, value: "< 1 sec", desc: "Average response to customer queries" },
          { icon: TrendingUp, value: "+67%", desc: "Average increase in qualified leads" },
          { icon: DollarSign, value: "R180K/yr", desc: "Average annual support cost saved" },
        ],
        features: [
          "Natural language understanding",
          "WhatsApp Business API integration",
          "Multi-language support (Zulu, Xhosa, Afrikaans)",
          "Appointment booking and calendar sync",
          "Lead qualification and CRM handoff",
          "Product recommendations and upselling",
          "Seamless human escalation",
        ],
      },
      {
        id: "ai-training",
        icon: GraduationCap,
        title: "AI Training & Upskilling",
        subtitle: "Equip your team to lead in an AI world.",
        description:
          "Technology is only as powerful as the people using it. We run practical, business-focused AI training sessions. from AI literacy workshops to hands-on tool training. so your team can leverage AI confidently and responsibly.",
        outcomes: [
          { icon: Clock, value: "1–2 days", desc: "Typical workshop duration" },
          { icon: TrendingUp, value: "3x", desc: "Average productivity improvement post-training" },
          { icon: DollarSign, value: "In-house", desc: "Capability built inside your business" },
        ],
        features: [
          "AI literacy workshops for non-technical teams",
          "Hands-on tool training (ChatGPT, Copilot, etc.)",
          "Prompt engineering for business use",
          "AI ethics and governance guidance",
          "Department-specific use case sessions",
          "Custom learning materials and playbooks",
        ],
      },
    ],
  },
  {
    id: "development",
    label: "Development",
    color: "from-[#3B82F6] to-blue-700",
    services: [
      {
        id: "web-development",
        icon: Globe,
        title: "Web Development",
        subtitle: "Your digital presence, done right.",
        description:
          "A premium website is your best salesperson. working 24/7, converting visitors into clients, and positioning your brand at the top of your market. We design and build fast, beautiful, conversion-optimised websites that reflect the quality of your business.",
        outcomes: [
          { icon: TrendingUp, value: "+40%", desc: "Average increase in conversion rate" },
          { icon: Clock, value: "2–4 wks", desc: "Typical delivery timeline" },
          { icon: DollarSign, value: "Top 1%", desc: "Design and performance standards" },
        ],
        features: [
          "Custom design. no templates",
          "Mobile-first and fully responsive",
          "SEO-optimised from day one",
          "CMS integration (content you can manage)",
          "Performance-optimised (sub-2s load time)",
          "Analytics and conversion tracking setup",
          "Ongoing maintenance and updates",
        ],
      },
      {
        id: "app-development",
        icon: Smartphone,
        title: "App Development",
        subtitle: "Mobile-first products your customers will love.",
        description:
          "From customer-facing mobile apps to internal operations tools, we build polished, performant applications for iOS and Android. Every app is built with a clear business objective. acquiring users, driving revenue, or streamlining operations.",
        outcomes: [
          { icon: Clock, value: "6–12 wks", desc: "Typical MVP delivery" },
          { icon: TrendingUp, value: "4.8★", desc: "Average app store rating for our builds" },
          { icon: DollarSign, value: "Cross-platform", desc: "iOS and Android from one codebase" },
        ],
        features: [
          "iOS and Android (React Native / Flutter)",
          "UI/UX design included",
          "API and backend development",
          "Push notifications and in-app messaging",
          "Payment gateway integration",
          "App Store and Play Store submission",
          "Post-launch support and iteration",
        ],
      },
      {
        id: "saas-development",
        icon: Layers,
        title: "SaaS Development",
        subtitle: "Build the software your market is waiting for.",
        description:
          "Have a software idea that solves a real problem? We take it from concept to a revenue-generating SaaS product. architecture, design, development, and launch. Built to scale from day one.",
        outcomes: [
          { icon: Clock, value: "8–16 wks", desc: "Typical time to first paying customer" },
          { icon: TrendingUp, value: "Scalable", desc: "Infrastructure built for growth" },
          { icon: DollarSign, value: "MRR", desc: "Built around recurring revenue models" },
        ],
        features: [
          "Product scoping and architecture design",
          "Full-stack development (Next.js, Node, etc.)",
          "Multi-tenant SaaS infrastructure",
          "Subscription billing and payment integration",
          "Admin dashboard and user management",
          "API development for third-party integrations",
          "Ongoing feature development and scaling",
        ],
      },
      {
        id: "ecommerce",
        icon: ShoppingBag,
        title: "E-commerce Development",
        subtitle: "Sell more. Work less.",
        description:
          "We build high-converting e-commerce stores with the automation built in. AI-powered product recommendations, automated order management, inventory alerts, and abandoned cart recovery. Your store works even when you don't.",
        outcomes: [
          { icon: TrendingUp, value: "+35%", desc: "Average revenue uplift post-launch" },
          { icon: Clock, value: "2–5 wks", desc: "Typical store launch timeline" },
          { icon: DollarSign, value: "Automated", desc: "Order, inventory, and fulfilment workflows" },
        ],
        features: [
          "Shopify, WooCommerce, or custom builds",
          "AI product recommendations",
          "Automated order and inventory management",
          "Abandoned cart recovery sequences",
          "Payment gateway integration (local and international)",
          "SEO and performance optimisation",
          "Analytics and sales dashboard",
        ],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Growth",
    color: "from-emerald-500 to-teal-600",
    services: [
      {
        id: "branding",
        icon: Palette,
        title: "Branding & Design",
        subtitle: "A brand that commands premium prices.",
        description:
          "Your brand is the first thing clients judge you on. We craft visual identities that communicate quality, trust, and authority. from logo and colour palette to brand guidelines that keep every touchpoint consistent.",
        outcomes: [
          { icon: TrendingUp, value: "Premium", desc: "Positioning that justifies your prices" },
          { icon: Clock, value: "1–2 wks", desc: "Brand identity delivery" },
          { icon: DollarSign, value: "Full kit", desc: "Everything you need to show up consistently" },
        ],
        features: [
          "Logo design and brand identity",
          "Colour palette and typography system",
          "Brand guidelines document",
          "Business card and stationery design",
          "Social media templates",
          "Pitch deck and presentation design",
          "Brand refresh for existing businesses",
        ],
      },
      {
        id: "seo",
        icon: Search,
        title: "SEO",
        subtitle: "Get found by the clients you actually want.",
        description:
          "We build long-term organic visibility through technical SEO, content strategy, and local search optimisation. so the right customers find you before they find your competitors. No black-hat tricks, no vanity rankings.",
        outcomes: [
          { icon: TrendingUp, value: "Top 3", desc: "Target ranking position for core keywords" },
          { icon: Clock, value: "60–90 days", desc: "Time to measurable ranking movement" },
          { icon: DollarSign, value: "Compounding", desc: "ROI that grows over time" },
        ],
        features: [
          "Technical SEO audit and fixes",
          "Keyword research and strategy",
          "On-page and content optimisation",
          "Local SEO and Google Business Profile",
          "Link building and authority development",
          "Monthly ranking and traffic reports",
          "Competitor analysis and gap strategy",
        ],
      },
      {
        id: "social-media",
        icon: Share2,
        title: "Social Media Management",
        subtitle: "Consistent presence. Real engagement.",
        description:
          "We manage your social media with a strategy-first approach. content that builds authority, campaigns that drive leads, and a consistent brand voice that turns followers into clients.",
        outcomes: [
          { icon: TrendingUp, value: "+3x", desc: "Average engagement growth in 90 days" },
          { icon: Clock, value: "Daily", desc: "Active management and community engagement" },
          { icon: DollarSign, value: "Leads", desc: "Social as a measurable revenue channel" },
        ],
        features: [
          "Platform strategy (LinkedIn, Instagram, Facebook, TikTok)",
          "Monthly content calendar",
          "Professional content creation and design",
          "Paid social advertising management",
          "Community management and engagement",
          "Monthly performance reporting",
          "Influencer and partnership outreach",
        ],
      },
      {
        id: "content",
        icon: Film,
        title: "Content Production",
        subtitle: "Content that builds authority and drives action.",
        description:
          "From blog articles and video scripts to case studies and email sequences. we produce strategic content that positions you as the expert in your field and moves prospects through your funnel.",
        outcomes: [
          { icon: TrendingUp, value: "Authority", desc: "Establish industry thought leadership" },
          { icon: Clock, value: "Consistent", desc: "Regular publishing cadence maintained" },
          { icon: DollarSign, value: "Pipeline", desc: "Content that generates real leads" },
        ],
        features: [
          "Blog and article writing",
          "Video production and editing",
          "Email marketing sequences",
          "Case study and whitepaper writing",
          "Podcast production and show notes",
          "Ad copywriting (Google, Meta, LinkedIn)",
          "Content strategy and editorial calendar",
        ],
      },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    color: "from-orange-500 to-amber-600",
    services: [
      {
        id: "managed-it",
        icon: Server,
        title: "Managed IT & Cloud",
        subtitle: "Enterprise infrastructure. Without the enterprise headache.",
        description:
          "We manage your entire IT environment. cloud hosting, cybersecurity, backups, and system monitoring. so you can run your business without worrying about downtime, data loss, or security threats.",
        outcomes: [
          { icon: Clock, value: "99.9%", desc: "Guaranteed uptime SLA" },
          { icon: TrendingUp, value: "24/7", desc: "Monitoring and incident response" },
          { icon: DollarSign, value: "50–70%", desc: "vs. in-house IT team cost" },
        ],
        features: [
          "Cloud hosting and management (AWS, GCP, Azure)",
          "Cybersecurity monitoring and threat response",
          "Automated backup and disaster recovery",
          "Microsoft 365 and Google Workspace management",
          "Hardware procurement and lifecycle management",
          "IT helpdesk and staff support",
          "Compliance and data governance (POPIA)",
        ],
      },
    ],
  },
];

export function ServiceDetail() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {categories.map((category) => (
          <div key={category.id} id={category.id}>
            {/* Category header */}
            <AnimatedSection className="mb-12">
              <div className="flex items-center gap-4 mb-2">
                <div className={`h-px flex-1 opacity-30 ${isLight ? "bg-black" : `bg-gradient-to-r ${category.color}`}`} />
                <span
                  className="section-tag"
                  style={isLight ? {
                    backgroundColor: "rgba(0,0,0,0.06)",
                    color: "#0B0B0C",
                    border: "1px solid rgba(0,0,0,0.18)",
                  } : undefined}
                >
                  {category.label}
                </span>
                <div className={`h-px flex-1 opacity-30 ${isLight ? "bg-black" : `bg-gradient-to-l ${category.color}`}`} />
              </div>
            </AnimatedSection>

            {/* Services in this category */}
            <div className="space-y-20">
              {category.services.map((service, idx) => (
                <div
                  key={service.id}
                  id={service.id}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch",
                    idx % 2 === 1 && "lg:[direction:rtl] *:[direction:ltr]"
                  )}
                >
                  {/* Content */}
                  <AnimatedSection direction={idx % 2 === 0 ? "left" : "right"} className="flex flex-col h-full">
                    <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${isLight ? "text-black/40" : "text-white/40"}`}>
                      {service.subtitle}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                          isLight ? "bg-black" : `bg-gradient-to-br ${category.color}`
                        }`}
                      >
                        <service.icon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className={`text-3xl md:text-4xl font-bold ${isLight ? "text-black" : ""}`}>{service.title}</h2>
                    </div>
                    <p className={`leading-relaxed mb-8 ${isLight ? "text-black/60" : "text-white/60"}`}>{service.description}</p>

                    {/* Outcome metrics */}
                    <div className="grid grid-cols-3 gap-4 mt-auto">
                      {service.outcomes.map((outcome) => {
                        const glowCfg = isLight ? lightGlow : (categoryGlowConfig[category.id] ?? lightGlow);
                        return (
                          <BorderGlow
                            key={outcome.desc}
                            backgroundColor={isLight ? "#ffffff" : "#141416"}
                            borderRadius={16}
                            colors={glowCfg.colors}
                            glowColor={glowCfg.glowColor}
                            glowIntensity={0.8}
                            className={isLight ? "!border-black/10" : ""}
                          >
                            <div className="p-4 text-center">
                              <outcome.icon className={`w-5 h-5 mx-auto mb-2 ${isLight ? "text-black" : "text-[#3FE0D0]"}`} />
                              <div className={`text-xl font-bold mb-1 ${isLight ? "text-black" : "gradient-text"}`}>{outcome.value}</div>
                              <div className={`text-xs mt-1 ${isLight ? "text-black/55" : "text-white/60"}`}>{outcome.desc}</div>
                            </div>
                          </BorderGlow>
                        );
                      })}
                    </div>
                  </AnimatedSection>

                  {/* Features card */}
                  <AnimatedSection direction={idx % 2 === 0 ? "right" : "left"} delay={0.1} className="h-full">
                    {(() => {
                      const glowCfg = isLight ? lightGlow : (categoryGlowConfig[category.id] ?? lightGlow);
                      return (
                        <BorderGlow
                          backgroundColor={isLight ? "#ffffff" : "#141416"}
                          borderRadius={16}
                          colors={glowCfg.colors}
                          glowColor={glowCfg.glowColor}
                          glowIntensity={0.9}
                          className={isLight ? "!border-black/10" : ""}
                        >
                          <div className="p-8">
                            <h3 className={`text-sm font-semibold uppercase tracking-widest mb-6 ${isLight ? "text-black/40" : "text-white/40"}`}>
                              What&apos;s Included
                            </h3>
                            <div className="space-y-3">
                              {service.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3 group">
                                  <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? "text-black" : "text-[#3FE0D0]"}`} />
                                  <span className={`text-sm transition-colors duration-200 ${
                                    isLight
                                      ? "text-black/65 group-hover:text-black"
                                      : "text-white/70 group-hover:text-white"
                                  }`}>
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </BorderGlow>
                      );
                    })()}
                  </AnimatedSection>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
