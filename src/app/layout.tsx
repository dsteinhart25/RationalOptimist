import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rational Optimist Society",
  description:
    "Join a community of thinkers championing human prosperity through innovation, freedom, and technological progress. Free to join.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-navy text-white">{children}</body>
    </html>
  );
}
