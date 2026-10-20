import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice of Customer Radar",
  description: "Review intelligence agent — product-level complaint patterns, rating signals and recommended actions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
