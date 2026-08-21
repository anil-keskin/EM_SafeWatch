import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "SafeWatch | Erdemir Mühendislik",
  description:
    "KKD ve İSG saha simülasyonu. Kontrollük personeli için görsel antrenman aracı.",
  manifest: "/manifest.webmanifest",
  applicationName: "SafeWatch",
  appleWebApp: {
    capable: true,
    title: "SafeWatch",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#2e2e2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="flex min-h-dvh flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
