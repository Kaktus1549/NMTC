import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './style/global.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Netacad",
  description: "Platform for easy Moodle test creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
