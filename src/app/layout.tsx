import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nudge Strategizer",
  description: "Strategic input analyzer for creative nudges.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
