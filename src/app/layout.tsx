import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CIRCULR — Close the loop. Open the revenue.",
  description:
    "Consultoría de economía circular potenciada por IA. Cumplimiento CSRD, diagnósticos CE y planes de implementación para PYMEs europeas.",
  icons: {
    icon: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} font-body antialiased bg-black text-off-white`}
      >
        <PostHogProvider>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1C1C1C",
              border: "1px solid rgba(61, 61, 61, 0.3)",
              color: "#F5F5F0",
            },
          }}
        />
        </PostHogProvider>
      </body>
    </html>
  );
}
