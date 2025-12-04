import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Infinity8 - Premium Coworking Spaces",
  description: "Book your ideal workspace at Infinity8 - Malaysia's premier coworking destination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          {/* Background effects */}
          <div className="gradient-bg" />
          <div className="noise-overlay" />
          
          <Navbar />
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
