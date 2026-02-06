import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rational Optimist",
  description:
    "Embracing progress through reason, evidence, and a belief in human potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
