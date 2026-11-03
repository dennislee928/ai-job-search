"use client";

import { useState } from "react";
import styles from "./saved.module.css";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type SavedOffer = {
  id: string;
  kind: string;
  name: string;
  institution: string;
  sponsor: string;
  level: string;
  field: string;
  duration_years: number;
  tuition: number;
  living_cost_per_year: number;
};

const kindLabel: Record<string, string> = {
  school: "學校",
  program: "學程",
  scholarship: "獎學金",
};

export default function SavedPage() {
  const [email, setEmail] = useState("student@example.edu");
  const [items, setItems] = useState<SavedOffer[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    setError("");
    setPending(true);
    try {
      const login = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const session = await login.json().catch(() => ({}));
      if (!login.ok || typeof session.token !== "string") {
        throw new Error(typeof session.error === "string" ? session.error : "登入失敗");
      }
      const response = await fetch(`${apiBase}/api/v1/programs`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "讀取失敗");
      }
      setItems(payload as SavedOffer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "讀取失敗");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.saved}>
      <header>
        <h1>已存項目</h1>
        <p>列出這個帳號存過的學校、學程與獎學金。</p>
      </header>
      <label>
        登入信箱
        <input aria-label="登入信箱" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <button type="button" onClick={load} disabled={pending}>
        讀取
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p>尚未載入項目。</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{kindLabel[item.kind] ?? item.kind}</strong>
              <span>{item.name}</span>
              <span>{item.sponsor || item.institution}</span>
              <span>
                {item.level} / {item.field} / {item.duration_years} 年
              </span>
              <span>
                學費 {item.tuition}，生活費 {item.living_cost_per_year}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
