import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "myfrAIm Personeelsportaal",
  description: "ImmoKeuring ESSP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
