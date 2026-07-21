import styles from "./applications.module.css";
import { Building2, Calendar, MapPin, ExternalLink } from "lucide-react";

export default function ApplicationsPage() {
  const columns = [
    {
      id: "applied",
      title: "Applied",
      color: "var(--accent-secondary)",
      items: [
        { id: 1, role: "Frontend Engineer", company: "Vercel", location: "Remote", date: "Oct 24" },
        { id: 2, role: "Senior UX Designer", company: "Spotify", location: "New York", date: "Oct 22" }
      ]
    },
    {
      id: "interviewing",
      title: "Interviewing",
      color: "var(--accent-primary)",
      items: [
        { id: 3, role: "Product Designer", company: "Stripe", location: "San Francisco", date: "Oct 20" }
      ]
    },
    {
      id: "offered",
      title: "Offered",
      color: "#10b981", // neon green
      items: [
        { id: 4, role: "Lead Designer", company: "Figma", location: "Remote", date: "Oct 15" }
      ]
    },
    {
      id: "rejected",
      title: "Rejected",
      color: "#ef4444", // neon red
      items: []
    }
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Applications</h1>
        <p className={styles.subtitle}>Track your job search progress.</p>
        <button className={styles.addBtn}>+ Track New Application</button>
      </header>

      <div className={styles.board}>
        {columns.map(col => (
          <div key={col.id} className={styles.column}>
            <div className={styles.colHeader}>
              <span className={styles.colDot} style={{ backgroundColor: col.color }}></span>
              <h3>{col.title}</h3>
              <span className={styles.count}>{col.items.length}</span>
            </div>
            
            <div className={styles.cardList}>
              {col.items.map(item => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h4>{item.role}</h4>
                    <button className={styles.iconBtn}><ExternalLink size={14} /></button>
                  </div>
                  
                  <div className={styles.companyRow}>
                    <Building2 size={14} />
                    <span>{item.company}</span>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.footerItem}>
                      <MapPin size={12} /> {item.location}
                    </div>
                    <div className={styles.footerItem}>
                      <Calendar size={12} /> {item.date}
                    </div>
                  </div>
                </div>
              ))}
              
              {col.items.length === 0 && (
                <div className={styles.emptyState}>No applications</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
