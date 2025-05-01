import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kanywst - Profile",
  description: "kanywst's professional profile - Architecture, Security, and Cloud Native expertise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
