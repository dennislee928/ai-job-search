import { Upload } from "lucide-react";
import styles from "./ResumeUpload.module.css";

export default function ResumeUpload() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Resume Analyzer</h3>
      </div>
      <div className={styles.dropzone}>
        <div className={styles.iconWrapper}>
          <Upload size={24} className={styles.uploadIcon} />
        </div>
        <p className={styles.text}>Upload your latest resume (PDF/DOCX)</p>
        <button className={styles.button}>
          Analyze with AI
        </button>
      </div>
    </div>
  );
}
