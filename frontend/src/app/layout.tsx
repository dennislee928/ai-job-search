import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "學程搜尋",
  description: "比較學程的 CP 值與未來情境。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className={styles.appContainer}>
          <Sidebar />
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
