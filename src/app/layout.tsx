import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEXIS CORE | Personal Legal Guardian",
  description: "Translating complex legalese into simple, visual Risk Maps with AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEXIS CORE",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

import { FocusProvider } from "./FocusContext";
import BottomNav from "./components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} font-bricolage antialiased relative min-h-screen screen-container`}>
        <FocusProvider>
          <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
            {children}
          </div>
        </FocusProvider>

        <BottomNav />
      </body>
    </html>
  );
}
