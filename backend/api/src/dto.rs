use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

pub const LEVELS: [&str; 5] = ["high_school", "bachelor", "master", "phd", "other"];
pub const KINDS: [&str; 3] = ["school", "program", "scholarship"];
pub const FIELDS: [&str; 7] = [
    "software",
    "medicine",
    "education",
    "business",
    "research",
    "trades",
    "other",
];
pub const COVERS: [&str; 3] = ["tuition", "living", "both"];

fn default_covers() -> String {
    "both".to_string()
}

pub fn default_years(level: &str) -> Option<f64> {
    match level {
        "high_school" => Some(3.0),
        "bachelor" => Some(4.0),
        "master" => Some(2.0),
        "phd" => Some(4.0),
        "other" => Some(1.0),
        _ => None,
    }
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct ProfileResponse {
    pub email: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProgramRequest {
    pub kind: String,
    pub name: String,
    #[serde(default)]
    pub institution: String,
    pub level: String,
    pub field: String,
    #[serde(default)]
    pub country: String,
    #[serde(default)]
    pub duration_years: Option<f64>,
    pub tuition: f64,
    pub living_cost_per_year: f64,
    pub annual_budget: f64,
    pub expected_starting_salary: f64,
    pub forgone_annual_income: f64,
    #[serde(default)]
    pub scholarship_amount_per_year: f64,
    #[serde(default = "default_covers")]
    pub scholarship_covers: String,
    #[serde(default)]
    pub sponsor: String,
    #[serde(default)]
    pub url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgramResponse {
    pub id: Uuid,
    pub kind: String,
    pub name: String,
    pub institution: String,
    pub sponsor: String,
    pub level: String,
    pub field: String,
    pub country: String,
    pub duration_years: f64,
    pub tuition: f64,
    pub living_cost_per_year: f64,
    pub annual_budget: f64,
    pub expected_starting_salary: f64,
    pub forgone_annual_income: f64,
    pub scholarship_amount_per_year: f64,
    pub scholarship_covers: String,
    pub url: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ProgramSearchRequest {
    pub query: String,
    #[serde(default = "default_limit")]
    pub limit: i64,
}

fn default_limit() -> i64 {
    5
}

#[derive(Debug, Serialize)]
pub struct ScoreResponse {
    pub id: Uuid,
    pub program_id: Uuid,
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
    pub created_at: DateTime<Utc>,
}

pub fn normalize_email(email: &str) -> Result<String, String> {
    let email = email.trim().to_lowercase();
    if email.len() > 255 || !email.contains('@') || email.contains(char::is_whitespace) {
        return Err("email is invalid".to_string());
    }
    let (local, domain) = email.split_once('@').ok_or("email is invalid")?;
    if local.is_empty() || domain.is_empty() || !domain.contains('.') {
        return Err("email is invalid".to_string());
    }
    Ok(email)
}

pub fn token_for_email(email: &str) -> String {
    format!("mock-jwt-token-for-{email}")
}

pub fn email_from_authorization(header: &str) -> Option<String> {
    let token = header.strip_prefix("Bearer ")?.trim();
    let email = token.strip_prefix("mock-jwt-token-for-")?;
    normalize_email(email).ok()
}

fn non_negative(label: &str, value: f64) -> Result<(), String> {
    if !value.is_finite() || value < 0.0 {
        return Err(format!("{label} must be zero or greater"));
    }
    Ok(())
}

pub fn prepare_offer(req: &mut CreateProgramRequest) -> Result<f64, String> {
    if req.name.trim().is_empty() || req.name.trim().chars().count() > 255 {
        return Err("name is required".to_string());
    }
    if !KINDS.contains(&req.kind.as_str()) {
        return Err("kind must be school, program, or scholarship".to_string());
    }
    if !LEVELS.contains(&req.level.as_str()) {
        return Err("level must be high_school, bachelor, master, phd, or other".to_string());
    }
    if !FIELDS.contains(&req.field.as_str()) {
        return Err(
            "field must be software, medicine, education, business, research, trades, or other"
                .to_string(),
        );
    }
    if req.kind == "program" && req.institution.trim().is_empty() {
        return Err("institution is required".to_string());
    }
    if req.kind == "scholarship" && req.sponsor.trim().is_empty() {
        return Err("sponsor is required".to_string());
    }
    if req.kind == "school" && req.institution.trim().is_empty() {
        req.institution = req.name.clone();
    }
    if !COVERS.contains(&req.scholarship_covers.as_str()) {
        return Err("scholarship_covers must be tuition, living, or both".to_string());
    }
    let years = match req.duration_years {
        Some(years) if years.is_finite() && years > 0.0 => years,
        None if req.kind == "school" => default_years(&req.level).unwrap(),
        _ => return Err("duration_years must be greater than 0".to_string()),
    };
    for (label, value) in [
        ("tuition", req.tuition),
        ("living_cost_per_year", req.living_cost_per_year),
        ("annual_budget", req.annual_budget),
        ("expected_starting_salary", req.expected_starting_salary),
        ("forgone_annual_income", req.forgone_annual_income),
        (
            "scholarship_amount_per_year",
            req.scholarship_amount_per_year,
        ),
    ] {
        non_negative(label, value)?;
    }
    Ok(years)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_request() -> CreateProgramRequest {
        CreateProgramRequest {
            kind: "program".into(),
            name: "Computer Science".into(),
            institution: "Example University".into(),
            level: "bachelor".into(),
            field: "software".into(),
            country: "TW".into(),
            duration_years: Some(4.0),
            tuition: 10000.0,
            living_cost_per_year: 8000.0,
            annual_budget: 20000.0,
            expected_starting_salary: 15000.0,
            forgone_annual_income: 0.0,
            scholarship_amount_per_year: 0.0,
            scholarship_covers: "both".into(),
            sponsor: String::new(),
            url: String::new(),
        }
    }

    #[test]
    fn accepts_a_program_and_defaults_school_years() {
        let mut req = valid_request();
        assert_eq!(prepare_offer(&mut req).unwrap(), 4.0);

        let mut school = valid_request();
        school.kind = "school".into();
        school.institution.clear();
        school.duration_years = None;
        school.level = "master".into();
        assert_eq!(prepare_offer(&mut school).unwrap(), 2.0);
        assert_eq!(school.institution, "Computer Science");
    }

    #[test]
    fn rejects_unknown_field_and_a_scholarship_without_a_sponsor() {
        let mut req = valid_request();
        req.field = "design".into();
        assert!(prepare_offer(&mut req).is_err());

        let mut scholarship = valid_request();
        scholarship.kind = "scholarship".into();
        scholarship.sponsor.clear();
        assert!(prepare_offer(&mut scholarship).is_err());
    }

    #[test]
    fn token_round_trips_the_email() {
        let email = normalize_email("Student@Example.edu").unwrap();
        let header = format!("Bearer {}", token_for_email(&email));
        assert_eq!(
            email_from_authorization(&header).as_deref(),
            Some(email.as_str())
        );
    }
}
