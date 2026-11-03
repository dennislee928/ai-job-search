"use client";

import { FormEvent, useState } from "react";
import styles from "./ProgramWorkbench.module.css";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type SearchHit = {
  score: number;
  payload?: { name?: string; institution?: string; text?: string };
};

type ScoreSnapshot = {
  cp_ratio: number;
  payback_years: number | null;
  ai_replacement_10: number;
  ai_replacement_20: number;
  ai_replacement_30: number;
  career_outlook_10: number;
  career_outlook_20: number;
  career_outlook_30: number;
  model_note: string;
};

type ProgramForm = {
  name: string;
  institution: string;
  level: string;
  duration_years: string;
  tuition: string;
  living_cost_per_year: string;
  opportunity_cost_per_year: string;
  expected_annual_premium: string;
  horizon_years: string;
  routine: string;
  social: string;
  physical: string;
  licensed: boolean;
  current_automation: string;
};

const emptyForm: ProgramForm = {
  name: "",
  institution: "",
  level: "bachelor",
  duration_years: "4",
  tuition: "10000",
  living_cost_per_year: "8000",
  opportunity_cost_per_year: "20000",
  expected_annual_premium: "15000",
  horizon_years: "10",
  routine: "0.4",
  social: "0.7",
  physical: "0.2",
  licensed: true,
  current_automation: "0.1",
};

async function requestJson(path: string, token: string, body?: unknown) {
  const response = await fetch(`${apiBase}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : typeof payload.detail === "string"
          ? payload.detail
          : "請求失敗";
    throw new Error(message);
  }
  return payload;
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function ProgramWorkbench() {
  const [email, setEmail] = useState("student@example.edu");
  const [token, setToken] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [score, setScore] = useState<ScoreSnapshot | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function update<K extends keyof ProgramForm>(key: K, value: ProgramForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function login() {
    const response = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || typeof payload.token !== "string") {
      throw new Error(typeof payload.error === "string" ? payload.error : "登入失敗");
    }
    setToken(payload.token);
    return payload.token as string;
  }

  async function ensureToken() {
    if (token) {
      return token;
    }
    return login();
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setError("");
    setHits([]);
    if (query.trim() === "") {
      setError("請輸入搜尋關鍵字");
      return;
    }
    setPending(true);
    try {
      const auth = await ensureToken();
      const results = (await requestJson("/api/v1/programs/search", auth, {
        query: query.trim(),
        limit: 5,
      })) as SearchHit[];
      setHits(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜尋失敗");
    } finally {
      setPending(false);
    }
  }

  async function onScore(event: FormEvent) {
    event.preventDefault();
    setError("");
    setScore(null);
    if (form.name.trim() === "" || form.institution.trim() === "") {
      setError("請填寫學程名稱與學校");
      return;
    }
    setPending(true);
    try {
      const auth = await ensureToken();
      const created = (await requestJson("/api/v1/programs", auth, {
        name: form.name.trim(),
        institution: form.institution.trim(),
        level: form.level,
        duration_years: Number(form.duration_years),
        tuition: Number(form.tuition),
        living_cost_per_year: Number(form.living_cost_per_year),
        opportunity_cost_per_year: Number(form.opportunity_cost_per_year),
        expected_annual_premium: Number(form.expected_annual_premium),
      })) as { id: string };
      const snapshot = (await requestJson(`/api/v1/programs/${created.id}/scores`, auth, {
        horizon_years: Number(form.horizon_years),
        routine: Number(form.routine),
        social: Number(form.social),
        physical: Number(form.physical),
        licensed: form.licensed,
        current_automation: Number(form.current_automation),
      })) as ScoreSnapshot;
      setScore(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "評分失敗");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.workbench}>
      <header>
        <h1>學程搜尋</h1>
        <p>比較學程的 CP 值，以及 10、20、30 年的情境。</p>
      </header>

      <form className={styles.search} onSubmit={onSearch}>
        <input
          aria-label="搜尋關鍵字"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋學程，例如 computer science"
        />
        <button type="submit" disabled={pending}>
          搜尋
        </button>
      </form>

      {hits.length > 0 && (
        <ul className={styles.hits}>
          {hits.map((hit, index) => (
            <li key={`${hit.payload?.name ?? "hit"}-${index}`}>
              <strong>{hit.payload?.name ?? hit.payload?.text ?? "學程"}</strong>
              <span>{hit.payload?.institution ?? ""}</span>
              <span>相似度 {hit.score.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={onScore}>
        <label>
          名稱
          <input aria-label="學程名稱" value={form.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label>
          學校
          <input
            aria-label="學校"
            value={form.institution}
            onChange={(event) => update("institution", event.target.value)}
          />
        </label>
        <label>
          等級
          <select aria-label="等級" value={form.level} onChange={(event) => update("level", event.target.value)}>
            <option value="high_school">高中</option>
            <option value="bachelor">學士</option>
            <option value="master">碩士</option>
            <option value="phd">博士</option>
            <option value="other">其他</option>
          </select>
        </label>
        <label>
          修業年數
          <input
            aria-label="修業年數"
            value={form.duration_years}
            onChange={(event) => update("duration_years", event.target.value)}
          />
        </label>
        <label>
          學費
          <input aria-label="學費" value={form.tuition} onChange={(event) => update("tuition", event.target.value)} />
        </label>
        <label>
          每年生活費
          <input
            aria-label="每年生活費"
            value={form.living_cost_per_year}
            onChange={(event) => update("living_cost_per_year", event.target.value)}
          />
        </label>
        <label>
          每年機會成本
          <input
            aria-label="每年機會成本"
            value={form.opportunity_cost_per_year}
            onChange={(event) => update("opportunity_cost_per_year", event.target.value)}
          />
        </label>
        <label>
          預期年薪溢價
          <input
            aria-label="預期年薪溢價"
            value={form.expected_annual_premium}
            onChange={(event) => update("expected_annual_premium", event.target.value)}
          />
        </label>
        <label>
          評估年數
          <input
            aria-label="評估年數"
            value={form.horizon_years}
            onChange={(event) => update("horizon_years", event.target.value)}
          />
        </label>
        <label>
          例行工作比例
          <input aria-label="例行工作比例" value={form.routine} onChange={(event) => update("routine", event.target.value)} />
        </label>
        <label>
          人際需求
          <input aria-label="人際需求" value={form.social} onChange={(event) => update("social", event.target.value)} />
        </label>
        <label>
          體能需求
          <input aria-label="體能需求" value={form.physical} onChange={(event) => update("physical", event.target.value)} />
        </label>
        <label>
          目前自動化程度
          <input
            aria-label="目前自動化程度"
            value={form.current_automation}
            onChange={(event) => update("current_automation", event.target.value)}
          />
        </label>
        <label className={styles.check}>
          <input
            aria-label="需要證照"
            type="checkbox"
            checked={form.licensed}
            onChange={(event) => update("licensed", event.target.checked)}
          />
          需要證照
        </label>
        <button type="submit" disabled={pending}>
          計算 CP 與情境
        </button>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {score && (
        <section className={styles.score} aria-label="評分結果">
          <h2>評分結果</h2>
          <p>CP 值 {score.cp_ratio.toFixed(2)}</p>
          <p>回收年數 {score.payback_years === null ? "無法回收" : score.payback_years.toFixed(1)}</p>
          <table>
            <thead>
              <tr>
                <th>年</th>
                <th>AI 取代機率</th>
                <th>預期生涯</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10</td>
                <td>{percent(score.ai_replacement_10)}</td>
                <td>{percent(score.career_outlook_10)}</td>
              </tr>
              <tr>
                <td>20</td>
                <td>{percent(score.ai_replacement_20)}</td>
                <td>{percent(score.career_outlook_20)}</td>
              </tr>
              <tr>
                <td>30</td>
                <td>{percent(score.ai_replacement_30)}</td>
                <td>{percent(score.career_outlook_30)}</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.note}>{score.model_note}</p>
        </section>
      )}
    </div>
  );
}
