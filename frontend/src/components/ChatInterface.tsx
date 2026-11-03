import { Send, Bot, MoreHorizontal, X } from "lucide-react";
import styles from "./ChatInterface.module.css";

export default function ChatInterface() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.botInfo}>
          <div className={styles.botIconWrapper}>
            <Bot size={18} className={styles.botIcon} />
          </div>
          <div>
            <h4>Cognito AI</h4>
            <span className={styles.subtitle}>Career Assistant</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn}><MoreHorizontal size={18} /></button>
          <button className={styles.actionBtn}><X size={18} /></button>
        </div>
      </div>
      
      <div className={styles.messages}>
        <div className={styles.messageRow}>
          <div className={styles.avatarBot}>🧠</div>
          <div className={styles.messageBubbleBot}>
            Hey Sarah! Based on your profile, I found some great matches. Tell me more about what you're looking for.
          </div>
        </div>
        
        <div className={`${styles.messageRow} ${styles.rowUser}`}>
          <div className={styles.messageBubbleUser}>
            I want a remote product design role in NYC with AI tools.
          </div>
          <div className={styles.avatarUser}>SJ</div>
        </div>
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          className={styles.input}
        />
        <button className={styles.sendButton}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
