import type { Metadata } from "next";
import Providers from "./providers";
import Reminders from "./components/Reminders";
import PushManager from "./components/PushManager";
import ScrollToTop from "./components/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Personal resource hub",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brain",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        <Providers>
          {children}
          <Reminders />
          <PushManager />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}