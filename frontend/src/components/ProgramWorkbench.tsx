"use client";

import { FormEvent, useState } from "react";
import styles from "./ProgramWorkbench.module.css";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const LEVEL_YEARS: Record<string, number> = {
  high_school: 3,
  bachelor: 4,
  master: 2,
  phd: 4,
  other: 1,
};

type Kind = "school" | "program" | "scholarship";

type SearchHit = {
  score: number;
  payload?: { name?: string; institution?: string; text?: string };
};

type ScoreSnapshot = {
  cp_ratio: number | null;
  payback_years: number | null;
  fully_covered: boolean;
  over_budget: boolean;
  ai_replacement_10: number;
  ai_replacement_20: number;
  ai_replacement_30: number;
  career_outlook_10: number;
  career_outlook_20: number;
  career_outlook_30: number;
  model_note: string;
};

type ProgramForm = {
  kind: Kind;
  name: string;
  institution: string;
  sponsor: string;
  level: string;
  field: string;
  country: string;
  duration_years: string;
  tuition: string;
  living_cost_per_year: string;
  annual_budget: string;
  expected_starting_salary: string;
  forgone_annual_income: string;
  scholarship_amount_per_year: string;
  scholarship_covers: string;
};

const emptyForm: ProgramForm = {
  kind: "school",
  name: "",
  institution: "",
  sponsor: "",
  level: "bachelor",
  field: "software",
  country: "",
  duration_years: "",
  tuition: "",
  living_cost_per_year: "",
  annual_budget: "",
  expected_starting_salary: "",
  forgone_annual_income: "0",
  scholarship_amount_per_year: "",
  scholarship_covers: "both",
};

async function requestJson(
  path: string,
  token: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {},
) {
  const method = options.method ?? (options.body === undefined ? "GET" : "POST");
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
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

function numberOrBlank(value: string) {
  if (value.trim() === "") {
    return 0;
  }
  return Number(value);
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
        body: { query: query.trim(), limit: 5 },
      })) as SearchHit[];
      setHits(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜尋失敗");
    } finally {
      setPending(false);
    }
  }

  function applyHit(hit: SearchHit) {
    const name = hit.payload?.name ?? hit.payload?.text ?? "";
    const institution = hit.payload?.institution ?? "";
    setForm((current) => ({
      ...current,
      name: name || current.name,
      institution: institution || current.institution,
    }));
  }

  async function onScore(event: FormEvent) {
    event.preventDefault();
    setError("");
    setScore(null);
    if (form.name.trim() === "") {
      setError("請填寫名稱");
      return;
    }
    if (form.kind === "program" && form.institution.trim() === "") {
      setError("請填寫學校");
      return;
    }
    if (form.kind === "scholarship" && form.sponsor.trim() === "") {
      setError("請填寫提供單位");
      return;
    }
    if (form.kind !== "school" && form.duration_years.trim() === "") {
      setError("請填寫年數");
      return;
    }
    const numbers = [
      form.tuition,
      form.living_cost_per_year,
      form.annual_budget,
      form.expected_starting_salary,
      form.forgone_annual_income,
      form.scholarship_amount_per_year,
      form.duration_years,
    ];
    if (numbers.some((value) => value.trim() !== "" && Number.isNaN(Number(value)))) {
      setError("請填數字");
      return;
    }
    setPending(true);
    try {
      const auth = await ensureToken();
      const body: Record<string, unknown> = {
        kind: form.kind,
        name: form.name.trim(),
        institution: form.institution.trim(),
        level: form.level,
        field: form.field,
        country: form.country.trim(),
        tuition: numberOrBlank(form.tuition),
        living_cost_per_year: numberOrBlank(form.living_cost_per_year),
        annual_budget: numberOrBlank(form.annual_budget),
        expected_starting_salary: numberOrBlank(form.expected_starting_salary),
        forgone_annual_income: numberOrBlank(form.forgone_annual_income),
        sponsor: form.sponsor.trim(),
        scholarship_amount_per_year: numberOrBlank(form.scholarship_amount_per_year),
        scholarship_covers: form.scholarship_covers,
      };
      if (form.duration_years.trim() !== "") {
        body.duration_years = Number(form.duration_years);
      }
      const created = (await requestJson("/api/v1/programs", auth, { body })) as { id: string };
      const snapshot = (await requestJson(`/api/v1/programs/${created.id}/scores`, auth, {
        method: "POST",
      })) as ScoreSnapshot;
      setScore(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "評分失敗");
    } finally {
      setPending(false);
    }
  }

  const durationLabel =
    form.kind === "scholarship" ? "領取年數" : form.kind === "school" ? "修業年數（可留空）" : "修業年數";

  return (
    <div className={styles.workbench}>
      <header>
        <h1>學校、學程、獎學金</h1>
        <p>先選類型，再比較淨成本、CP 值，以及 10、20、30 年的情境。</p>
      </header>

      <label>
        登入信箱
        <input aria-label="登入信箱" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

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
              <button type="button" onClick={() => applyHit(hit)}>
                帶入名稱
              </button>
              <strong>{hit.payload?.name ?? hit.payload?.text ?? "學程"}</strong>
              <span>{hit.payload?.institution ?? ""}</span>
              <span>相似度 {hit.score.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={onScore}>
        <div className={styles.kinds} role="group" aria-label="類型">
          {(
            [
              ["school", "學校"],
              ["program", "學程"],
              ["scholarship", "獎學金"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              aria-pressed={form.kind === kind}
              onClick={() => update("kind", kind)}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          名稱
          <input aria-label="名稱" value={form.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        {form.kind === "scholarship" && (
          <label>
            提供單位
            <input
              aria-label="提供單位"
              value={form.sponsor}
              onChange={(event) => update("sponsor", event.target.value)}
            />
          </label>
        )}
        {form.kind !== "school" && (
          <label>
            {form.kind === "program" ? "學校" : "相關學校或學程（可留空）"}
            <input
              aria-label={form.kind === "program" ? "學校" : "相關學校或學程"}
              value={form.institution}
              onChange={(event) => update("institution", event.target.value)}
            />
          </label>
        )}
        <label>
          國家
          <input aria-label="國家" value={form.country} onChange={(event) => update("country", event.target.value)} />
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
          領域
          <select aria-label="領域" value={form.field} onChange={(event) => update("field", event.target.value)}>
            <option value="software">軟體</option>
            <option value="medicine">醫療</option>
            <option value="education">教育</option>
            <option value="business">商管</option>
            <option value="research">研究</option>
            <option value="trades">技職</option>
            <option value="other">其他</option>
          </select>
        </label>
        <label>
          {durationLabel}
          <input
            aria-label={durationLabel}
            value={form.duration_years}
            placeholder={form.kind === "school" ? `預設 ${LEVEL_YEARS[form.level]} 年` : ""}
            onChange={(event) => update("duration_years", event.target.value)}
          />
        </label>
        <label>
          每年學費
          <input aria-label="每年學費" value={form.tuition} onChange={(event) => update("tuition", event.target.value)} />
        </label>
        <label>
          每年生活費
          <input
            aria-label="每年生活費"
            value={form.living_cost_per_year}
            onChange={(event) => update("living_cost_per_year", event.target.value)}
          />
        </label>
        {form.kind === "scholarship" && (
          <>
            <label>
              每年獎學金
              <input
                aria-label="每年獎學金"
                value={form.scholarship_amount_per_year}
                onChange={(event) => update("scholarship_amount_per_year", event.target.value)}
              />
            </label>
            <label>
              涵蓋範圍
              <select
                aria-label="涵蓋範圍"
                value={form.scholarship_covers}
                onChange={(event) => update("scholarship_covers", event.target.value)}
              >
                <option value="tuition">學費</option>
                <option value="living">生活費</option>
                <option value="both">學費與生活費</option>
              </select>
            </label>
          </>
        )}
        <label>
          每年可負擔金額
          <input
            aria-label="每年可負擔金額"
            value={form.annual_budget}
            onChange={(event) => update("annual_budget", event.target.value)}
          />
        </label>
        <label>
          畢業後預期起薪
          <input
            aria-label="畢業後預期起薪"
            value={form.expected_starting_salary}
            onChange={(event) => update("expected_starting_salary", event.target.value)}
          />
        </label>
        <label>
          若不走這條路的年收入
          <input
            aria-label="若不走這條路的年收入"
            value={form.forgone_annual_income}
            onChange={(event) => update("forgone_annual_income", event.target.value)}
          />
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
          {score.fully_covered ? (
            <p>獎學金全額負擔，不計算 CP 值。回收年數 0。</p>
          ) : (
            <>
              <p>CP 值 {score.cp_ratio === null ? "無法計算" : score.cp_ratio.toFixed(2)}</p>
              <p>回收年數 {score.payback_years === null ? "無法回收" : score.payback_years.toFixed(1)}</p>
            </>
          )}
          {score.over_budget && <p>扣掉獎學金後，每年支出仍超過可負擔金額。</p>}
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
