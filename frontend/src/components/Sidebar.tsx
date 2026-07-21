"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, FileText, Video, Route, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: FileText, label: "Applications", href: "/applications" },
  { icon: Video, label: "Interviews", href: "/interviews" },
  { icon: Route, label: "AI Career Path", href: "/path" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>🧠</div>
        <h2>Cognito <span>AI</span></h2>
      </div>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>SJ</div>
        <div className={styles.userInfo}>
          <h3>Sarah J.</h3>
          <p>Senior UX Designer</p>
          <span className={styles.status}>
            <span className={styles.statusDot}></span> online
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
