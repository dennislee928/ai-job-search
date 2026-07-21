import styles from "./settings.module.css";
import { User, Bell, Lock, Link as LinkIcon, Download } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and integrations.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <button className={`${styles.tab} ${styles.active}`}><User size={16} /> Account</button>
          <button className={styles.tab}><Bell size={16} /> Notifications</button>
          <button className={styles.tab}><Lock size={16} /> Privacy & Security</button>
          <button className={styles.tab}><LinkIcon size={16} /> Integrations</button>
          <button className={styles.tab}><Download size={16} /> Data Export</button>
        </div>

        <div className={styles.mainSettings}>
          <div className={styles.card}>
            <h2>Account Details</h2>
            
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" defaultValue="Sarah Jenkins" className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input type="email" defaultValue="sarah.jenkins@example.com" className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Current Role</label>
              <input type="text" defaultValue="Senior UX Designer" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea 
                className={styles.textarea} 
                rows={4}
                defaultValue="I'm a product designer who loves building accessible, user-centric experiences. Currently looking for remote opportunities."
              ></textarea>
            </div>
            
            <div className={styles.actions}>
              <button className={styles.btnPrimary}>Save Changes</button>
            </div>
          </div>
          
          <div className={styles.card}>
            <h2>Theme Preferences</h2>
            <div className={styles.themeOptions}>
              <label className={styles.radioLabel}>
                <input type="radio" name="theme" defaultChecked />
                <span>Dark Mode (System Default)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
