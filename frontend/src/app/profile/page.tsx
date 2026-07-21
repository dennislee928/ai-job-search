import styles from "./profile.module.css";
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Profile</h1>
        <p className={styles.subtitle}>Manage your resume and personal details.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarLarge}>SJ</div>
            <div className={styles.basicInfo}>
              <h2>Sarah Jenkins</h2>
              <p className={styles.jobTitle}>Senior UX Designer</p>
              <button className={styles.btnSecondary}>Edit Profile</button>
            </div>
          </div>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <Mail size={16} />
              <span>sarah.jenkins@example.com</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={16} />
              <span>San Francisco, CA (Remote)</span>
            </div>
            <div className={styles.contactItem}>
              <Linkedin size={16} />
              <span>linkedin.com/in/sarahjenkins</span>
            </div>
            <div className={styles.contactItem}>
              <Github size={16} />
              <span>github.com/sarahj</span>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.card} ${styles.skillsCard}`}>
            <h3>Top Skills</h3>
            <div className={styles.skillsList}>
              {["Figma", "User Research", "Prototyping", "UI/UX Design", "Wireframing", "React", "HTML/CSS", "Design Systems"].map(skill => (
                <span key={skill} className={styles.skillPill}>{skill}</span>
              ))}
            </div>
            <button className={styles.btnOutline}>+ Add Skill</button>
          </div>

          <div className={`${styles.card} ${styles.resumeCard}`}>
            <h3>Current Resume</h3>
            <div className={styles.resumeStatus}>
              <div className={styles.pdfIcon}>PDF</div>
              <div className={styles.resumeInfo}>
                <h4>Sarah_Jenkins_Resume_2026.pdf</h4>
                <p>Updated 2 days ago</p>
              </div>
            </div>
            <div className={styles.resumeActions}>
              <button className={styles.btnSecondary}>View</button>
              <button className={styles.btnPrimary}>Upload New</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
