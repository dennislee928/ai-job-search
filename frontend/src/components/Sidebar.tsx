"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Search } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { icon: Search, label: "搜尋", href: "/" },
  { icon: Bookmark, label: "已存項目", href: "/saved" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>🎓</div>
        <h2>學程<span>搜尋</span></h2>
      </div>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>學</div>
        <div className={styles.userInfo}>
          <h3>學生</h3>
          <p>學校、學程、獎學金</p>
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
              key={item.href}
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
