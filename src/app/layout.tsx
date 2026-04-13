import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { CookieBanner } from "@/components/layout/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Deluxify: AI, Technology and Automation",
    template: "%s | Deluxify",
  },
  description:
    "Deluxify helps businesses across South Africa and Africa automate operations, deploy AI chatbots, and scale revenue with cutting-edge AI solutions.",
  keywords: [
    "AI automation",
    "chatbots",
    "South Africa AI",
    "business automation",
    "AI consulting",
    "machine learning",
    "Deluxify",
  ],
  authors: [{ name: "Deluxify" }],
  creator: "Deluxify",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://deluxify.ai",
    siteName: "Deluxify",
    title: "Deluxify: AI, Technology and Automation",
    description:
      "Transform your business with intelligent AI automation. Save time, increase revenue, and outpace competition.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Deluxify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deluxify: AI, Technology and Automation",
    description: "Transform your business with intelligent AI automation.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  metadataBase: new URL("https://deluxify.ai"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
