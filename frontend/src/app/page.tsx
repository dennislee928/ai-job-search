import ResumeUpload from "@/components/ResumeUpload";
import ChatInterface from "@/components/ChatInterface";
import JobMatchCard from "@/components/JobMatchCard";
import styles from "./page.module.css";

export default function Home() {
  const mockJobs = [
    {
      id: 1,
      title: "Senior Product Designer",
      company: "Stripe",
      companyInitials: "S",
      location: "San Francisco, CA",
      matchScore: 94,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    },
    {
      id: 2,
      title: "AI Design Lead",
      company: "Google",
      companyInitials: "G",
      location: "San Francisco, CA",
      matchScore: 88,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    },
    {
      id: 3,
      title: "Senior Product Designer",
      company: "Stripe",
      companyInitials: "S",
      location: "San Francisco, CA",
      matchScore: 94,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    },
    {
      id: 4,
      title: "AI Design Lead",
      company: "Google",
      companyInitials: "G",
      location: "San Francisco, CA",
      matchScore: 88,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    },
    {
      id: 5,
      title: "Senior Product Designer",
      company: "Stripe",
      companyInitials: "S",
      location: "San Francisco, CA",
      matchScore: 94,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    },
    {
      id: 6,
      title: "AI Design Lead",
      company: "Google",
      companyInitials: "G",
      location: "San Francisco, CA",
      matchScore: 88,
      skillsMatched: 10,
      skillsTotal: 12,
      gaps: 2,
      tags: ["Figma", "AI/ML", "User Research"]
    }
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome back, Sarah!</h1>
        <p className={styles.subtitle}>Let's find your dream role.</p>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder='Ask Cognito AI anything: "Find remote product design roles in NYC..."'
          />
        </div>
      </header>

      <div className={styles.topSection}>
        <div className={styles.resumeCol}>
          <ResumeUpload />
        </div>
        <div className={styles.chatCol}>
          <ChatInterface />
        </div>
      </div>

      <div className={styles.matchesSection}>
        <h2>Top Job Matches (Powered by AI)</h2>
        <div className={styles.grid}>
          {mockJobs.map(job => (
            <JobMatchCard key={job.id} {...job} />
          ))}
        </div>
      </div>
    </div>
  );
}
