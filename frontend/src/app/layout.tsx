import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio | Software Engineer",
    template: "%s | Portfolio",
  },
  description: "Full-stack software engineer specializing in scalable systems, real-time applications, and modern web technologies.",
  keywords: ["software engineer", "portfolio", "full-stack", "Next.js", "FastAPI", "WebSocket"],
  authors: [{ name: "Software Engineer" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Portfolio | Software Engineer",
    description: "Full-stack software engineer portfolio",
    siteName: "Portfolio",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
