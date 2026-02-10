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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-bg text-text-primary">{children}</body>
    </html>
  );
}
