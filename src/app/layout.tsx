import type { Metadata, Viewport } from "next";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://imstillhere.app"),
  title: "I'm Still Here — Prove You're Alive",
  description: "One tap, every day. Miss one? Your people find out. A dead-simple daily check-in.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StillHere",
  },
  openGraph: {
    title: "I'm Still Here — Prove You're Alive",
    description: "One tap, every day. Miss one? Your people find out.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "I'm still alive. 💀" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "I'm Still Here — Prove You're Alive",
    description: "One tap, every day. Miss one? Your people find out.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1120",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased safe-top safe-bottom bg-dark-bg">
        <ThemeProvider>
          <ToastProvider>
            <ServiceWorkerProvider>
              {children}
            </ServiceWorkerProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
