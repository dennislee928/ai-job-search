import { MapPin, Briefcase } from "lucide-react";
import styles from "./JobMatchCard.module.css";

type JobMatchCardProps = {
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  matchScore: number;
  skillsMatched: number;
  skillsTotal: number;
  gaps: number;
  tags: string[];
};

export default function JobMatchCard({
  title,
  company,
  companyInitials,
  location,
  matchScore,
  skillsMatched,
  skillsTotal,
  gaps,
  tags
}: JobMatchCardProps) {
  // Calculate SVG stroke dasharray
  const circumference = 2 * Math.PI * 26; // r=26
  const strokeDasharray = `${(matchScore / 100) * circumference} ${circumference}`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.companyLogo}>
          {companyInitials}
        </div>
        <div className={styles.titleInfo}>
          <h3>{title}</h3>
          <span className={styles.companyName}>at {company}</span>
        </div>
      </div>
      
      <div className={styles.meta}>
        <span className={styles.metaItem}><MapPin size={12} /> {location}</span>
        <span className={styles.metaItem}><Briefcase size={12} /> Remote</span>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.progressCircle}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" className={styles.bgCircle} />
            <circle 
              cx="32" cy="32" r="26" 
              className={styles.fgCircle}
              strokeDasharray={strokeDasharray}
            />
          </svg>
          <div className={styles.percentage}>
            <span className={styles.num}>{matchScore}%</span>
            <span className={styles.lbl}>Match</span>
          </div>
        </div>
        
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.dotMatch}></span>
            <span className={styles.detailLabel}>Matches:</span>
            <span className={styles.detailValue}>{skillsMatched}/{skillsTotal}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.dotGap}></span>
            <span className={styles.detailLabel}>Gaps:</span>
            <span className={styles.detailValue}>{gaps}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.tags}>
        {tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      
      <div className={styles.actions}>
        <button className={styles.btnPrimary}>Apply Now</button>
        <button className={styles.btnSecondary}>Save</button>
      </div>
    </div>
  );
}
