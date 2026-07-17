import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.walltrust.app"),
  // A plain string (not { default, template }) — every page under
  // app/(marketing) already builds its own complete, correctly-branded
  // title (e.g. "Pricing — WallTrust"). A "%s — WallTrust" template
  // applied on top of those caused every marketing page to render
  // "WallTrust" twice in <title>. This string still covers any route that
  // doesn't set its own title, same as `default` would, just with no
  // template applied to routes that do.
  title: "WallTrust — Build your wall of trust",
  description:
    "Collect customer testimonials with a shareable link and display them on any website with one line of code. Unlimited testimonials, Google Rich Snippets, no branding — from $7/mo.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "WallTrust",
    url: "/",
    title: "WallTrust — Build your wall of trust",
    description:
      "Unlimited testimonials, Google Rich Snippets, no branding — from $7/mo.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "WallTrust — Build your wall of trust",
    description:
      "Unlimited testimonials, Google Rich Snippets, no branding — from $7/mo.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
