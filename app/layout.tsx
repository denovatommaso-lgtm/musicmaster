import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicMaster",
  description: "A fast-paced music guessing game built for the web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
