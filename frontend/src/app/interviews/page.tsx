import styles from "./interviews.module.css";
import { Video, Calendar, Clock, Sparkles } from "lucide-react";

export default function InterviewsPage() {
  const interviews = [
    {
      id: 1,
      company: "Stripe",
      role: "Product Designer",
      date: "Tomorrow",
      time: "10:00 AM PST",
      type: "Technical / Portfolio Review",
      link: "https://meet.google.com/abc-defg-hij"
    },
    {
      id: 2,
      company: "Vercel",
      role: "Frontend Engineer",
      date: "Oct 28, 2026",
      time: "2:00 PM PST",
      type: "Cultural Fit",
      link: "https://zoom.us/j/123456789"
    }
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Interviews</h1>
        <p className={styles.subtitle}>Prepare and crush your upcoming interviews.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.upcomingList}>
          <h2>Upcoming</h2>
          
          {interviews.map(interview => (
            <div key={interview.id} className={styles.interviewCard}>
              <div className={styles.cardHeader}>
                <div className={styles.companyInfo}>
                  <div className={styles.companyInitial}>{interview.company.charAt(0)}</div>
                  <div>
                    <h3>{interview.company}</h3>
                    <p>{interview.role}</p>
                  </div>
                </div>
                <div className={styles.typeTag}>{interview.type}</div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.timeInfo}>
                  <div className={styles.timeItem}>
                    <Calendar size={16} /> {interview.date}
                  </div>
                  <div className={styles.timeItem}>
                    <Clock size={16} /> {interview.time}
                  </div>
                </div>
                
                <div className={styles.actions}>
                  <button className={styles.btnSecondary}>
                    <Video size={16} /> Join Call
                  </button>
                  <button className={styles.btnPrimary}>
                    <Sparkles size={16} /> AI Mock Interview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.prepSidebar}>
          <div className={styles.prepCard}>
            <div className={styles.prepIcon}>🤖</div>
            <h3>Interview Prep Mode</h3>
            <p>Generate personalized mock interview questions based on your resume and the job description.</p>
            <button className={styles.btnOutline}>Start Practice Session</button>
          </div>
        </div>
      </div>
    </div>
  );
}
