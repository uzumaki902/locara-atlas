// Import Next.js Metadata type
import type { Metadata } from "next";

// Import Google Fonts
import { Geist, Geist_Mono } from "next/font/google";

// Import global CSS
import "./globals.css";

// Configure Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO Metadata
export const metadata: Metadata = {
  title: "Locara Atlas",
  description: "Enterprise Dataset Delivery Platform",
};

import { Toaster } from "react-hot-toast";

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#14141F',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '13px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}