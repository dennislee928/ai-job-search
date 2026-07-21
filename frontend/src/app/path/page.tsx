import styles from "./path.module.css";
import { Milestone, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export default function PathPage() {
  const steps = [
    {
      id: 1,
      title: "Master React Server Components",
      description: "Based on your target roles, 85% require deep Next.js knowledge.",
      status: "completed",
      resource: "Next.js Official Documentation"
    },
    {
      id: 2,
      title: "Build a Full-Stack AI App",
      description: "Demonstrate your ability to integrate LLMs (OpenAI/Anthropic) into a product.",
      status: "in-progress",
      resource: "Cognito AI Project Ideas"
    },
    {
      id: 3,
      title: "System Design Interview Prep",
      description: "Practice designing scalable systems. Crucial for Staff-level roles.",
      status: "locked",
      resource: "System Design Primer"
    }
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>AI Career Path</h1>
        <p className={styles.subtitle}>Your personalized roadmap to Staff Engineer.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.roadmap}>
          {steps.map((step, index) => (
            <div key={step.id} className={`${styles.step} ${styles[step.status]}`}>
              <div className={styles.timeline}>
                <div className={styles.iconWrapper}>
                  {step.status === "completed" ? (
                    <CheckCircle2 size={24} className={styles.iconCompleted} />
                  ) : step.status === "in-progress" ? (
                    <Milestone size={24} className={styles.iconProgress} />
                  ) : (
                    <Circle size={24} className={styles.iconLocked} />
                  )}
                </div>
                {index < steps.length - 1 && <div className={styles.line}></div>}
              </div>
              
              <div className={styles.card}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className={styles.resource}>
                  <span>Recommended Resource:</span>
                  <a href="#">{step.resource} <ArrowRight size={14} /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
