use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::dto::{CreateProgramRequest, ProgramResponse, ScoreResponse};
use crate::error::ApiError;

#[derive(Debug, Clone, FromRow)]
pub struct UserRow {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

#[derive(Debug, FromRow)]
struct ProgramRow {
    id: Uuid,
    kind: String,
    name: String,
    institution: String,
    sponsor: String,
    level: String,
    field: String,
    country: String,
    duration_years: f64,
    tuition: f64,
    living_cost_per_year: f64,
    annual_budget: f64,
    expected_starting_salary: f64,
    forgone_annual_income: f64,
    scholarship_amount_per_year: f64,
    scholarship_covers: String,
    url: String,
    created_at: DateTime<Utc>,
}

const PROGRAM_COLUMNS: &str = "id, kind, name, institution, sponsor, level, field, country, duration_years, tuition, living_cost_per_year, annual_budget, expected_starting_salary, forgone_annual_income, scholarship_amount_per_year, scholarship_covers, url, created_at";

impl From<ProgramRow> for ProgramResponse {
    fn from(row: ProgramRow) -> Self {
        Self {
            id: row.id,
            kind: row.kind,
            name: row.name,
            institution: row.institution,
            sponsor: row.sponsor,
            level: row.level,
            field: row.field,
            country: row.country,
            duration_years: row.duration_years,
            tuition: row.tuition,
            living_cost_per_year: row.living_cost_per_year,
            annual_budget: row.annual_budget,
            expected_starting_salary: row.expected_starting_salary,
            forgone_annual_income: row.forgone_annual_income,
            scholarship_amount_per_year: row.scholarship_amount_per_year,
            scholarship_covers: row.scholarship_covers,
            url: row.url,
            created_at: row.created_at,
        }
    }
}

#[derive(Debug, FromRow)]
struct ScoreRow {
    id: Uuid,
    program_id: Uuid,
    inputs: Value,
    cp_ratio: Option<f64>,
    payback_years: Option<f64>,
    fully_covered: bool,
    over_budget: bool,
    ai_replacement_10: f64,
    ai_replacement_20: f64,
    ai_replacement_30: f64,
    career_outlook_10: f64,
    career_outlook_20: f64,
    career_outlook_30: f64,
    model_note: String,
    created_at: DateTime<Utc>,
}

impl From<ScoreRow> for ScoreResponse {
    fn from(row: ScoreRow) -> Self {
        Self {
            id: row.id,
            program_id: row.program_id,
            inputs: row.inputs,
            cp_ratio: row.cp_ratio,
            payback_years: row.payback_years,
            fully_covered: row.fully_covered,
            over_budget: row.over_budget,
            ai_replacement_10: row.ai_replacement_10,
            ai_replacement_20: row.ai_replacement_20,
            ai_replacement_30: row.ai_replacement_30,
            career_outlook_10: row.career_outlook_10,
            career_outlook_20: row.career_outlook_20,
            career_outlook_30: row.career_outlook_30,
            model_note: row.model_note,
            created_at: row.created_at,
        }
    }
}

pub async fn upsert_user(pool: &PgPool, email: &str) -> Result<UserRow, ApiError> {
    sqlx::query_as(
        "INSERT INTO users (email, first_name, last_name, role)
         VALUES ($1, 'Mock', 'User', 'candidate')
         ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
         RETURNING id, email, role",
    )
    .bind(email)
    .fetch_one(pool)
    .await
    .map_err(|err| {
        eprintln!("upsert user failed: {err}");
        ApiError::Internal
    })
}

pub async fn find_user_by_email(pool: &PgPool, email: &str) -> Result<Option<UserRow>, ApiError> {
    sqlx::query_as("SELECT id, email, role FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(pool)
        .await
        .map_err(|err| {
            eprintln!("find user failed: {err}");
            ApiError::Internal
        })
}

pub async fn insert_program(
    pool: &PgPool,
    user_id: Uuid,
    req: &CreateProgramRequest,
    duration_years: f64,
) -> Result<ProgramResponse, ApiError> {
    let row = sqlx::query_as::<_, ProgramRow>(&format!(
        "INSERT INTO education_programs (
            user_id, kind, name, institution, sponsor, level, field, country, duration_years,
            tuition, living_cost_per_year, annual_budget, expected_starting_salary,
            forgone_annual_income, scholarship_amount_per_year, scholarship_covers, url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING {PROGRAM_COLUMNS}"
    ))
    .bind(user_id)
    .bind(&req.kind)
    .bind(req.name.trim())
    .bind(req.institution.trim())
    .bind(req.sponsor.trim())
    .bind(&req.level)
    .bind(&req.field)
    .bind(req.country.trim())
    .bind(duration_years)
    .bind(req.tuition)
    .bind(req.living_cost_per_year)
    .bind(req.annual_budget)
    .bind(req.expected_starting_salary)
    .bind(req.forgone_annual_income)
    .bind(req.scholarship_amount_per_year)
    .bind(&req.scholarship_covers)
    .bind(req.url.trim())
    .fetch_one(pool)
    .await
    .map_err(|err| {
        eprintln!("insert program failed: {err}");
        ApiError::Internal
    })?;
    Ok(row.into())
}

pub async fn list_programs(pool: &PgPool, user_id: Uuid) -> Result<Vec<ProgramResponse>, ApiError> {
    let rows = sqlx::query_as::<_, ProgramRow>(&format!(
        "SELECT {PROGRAM_COLUMNS} FROM education_programs WHERE user_id = $1 ORDER BY created_at DESC"
    ))
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|err| {
        eprintln!("list programs failed: {err}");
        ApiError::Internal
    })?;
    Ok(rows.into_iter().map(ProgramResponse::from).collect())
}

pub async fn find_program(
    pool: &PgPool,
    user_id: Uuid,
    program_id: Uuid,
) -> Result<ProgramResponse, ApiError> {
    let row = sqlx::query_as::<_, ProgramRow>(&format!(
        "SELECT {PROGRAM_COLUMNS} FROM education_programs WHERE id = $1 AND user_id = $2"
    ))
    .bind(program_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|err| {
        eprintln!("find program failed: {err}");
        ApiError::Internal
    })?;
    row.map(ProgramResponse::from).ok_or(ApiError::NotFound)
}

pub struct NewScore {
    pub inputs: Value,
    pub cp_ratio: Option<f64>,
    pub payback_years: Option<f64>,
    pub fully_covered: bool,
    pub over_budget: bool,
    pub ai_replacement_10: f64,
    pub ai_replacement_20: f64,
    pub ai_replacement_30: f64,
    pub career_outlook_10: f64,
    pub career_outlook_20: f64,
    pub career_outlook_30: f64,
    pub model_note: String,
}

pub async fn insert_score(
    pool: &PgPool,
    program_id: Uuid,
    score: NewScore,
) -> Result<ScoreResponse, ApiError> {
    let row = sqlx::query_as::<_, ScoreRow>(
        "INSERT INTO score_snapshots (
            program_id, inputs, cp_ratio, payback_years, fully_covered, over_budget,
            ai_replacement_10, ai_replacement_20, ai_replacement_30,
            career_outlook_10, career_outlook_20, career_outlook_30,
            model_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, program_id, inputs, cp_ratio, payback_years, fully_covered, over_budget,
                  ai_replacement_10, ai_replacement_20, ai_replacement_30,
                  career_outlook_10, career_outlook_20, career_outlook_30,
                  model_note, created_at",
    )
    .bind(program_id)
    .bind(&score.inputs)
    .bind(score.cp_ratio)
    .bind(score.payback_years)
    .bind(score.fully_covered)
    .bind(score.over_budget)
    .bind(score.ai_replacement_10)
    .bind(score.ai_replacement_20)
    .bind(score.ai_replacement_30)
    .bind(score.career_outlook_10)
    .bind(score.career_outlook_20)
    .bind(score.career_outlook_30)
    .bind(score.model_note)
    .fetch_one(pool)
    .await
    .map_err(|err| {
        eprintln!("insert score failed: {err}");
        ApiError::Internal
    })?;
    Ok(row.into())
}

pub async fn list_scores(
    pool: &PgPool,
    user_id: Uuid,
    program_id: Uuid,
) -> Result<Vec<ScoreResponse>, ApiError> {
    find_program(pool, user_id, program_id).await?;
    let rows = sqlx::query_as::<_, ScoreRow>(
        "SELECT id, program_id, inputs, cp_ratio, payback_years, fully_covered, over_budget,
                ai_replacement_10, ai_replacement_20, ai_replacement_30,
                career_outlook_10, career_outlook_20, career_outlook_30,
                model_note, created_at
         FROM score_snapshots
         WHERE program_id = $1
         ORDER BY created_at DESC",
    )
    .bind(program_id)
    .fetch_all(pool)
    .await
    .map_err(|err| {
        eprintln!("list scores failed: {err}");
        ApiError::Internal
    })?;
    Ok(rows.into_iter().map(ScoreResponse::from).collect())
}
