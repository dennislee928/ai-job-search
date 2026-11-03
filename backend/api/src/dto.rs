use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

pub const LEVELS: [&str; 5] = ["high_school", "bachelor", "master", "phd", "other"];

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
    pub name: String,
    pub institution: String,
    pub level: String,
    #[serde(default)]
    pub field: String,
    #[serde(default)]
    pub country: String,
    pub duration_years: f64,
    pub tuition: f64,
    pub living_cost_per_year: f64,
    pub opportunity_cost_per_year: f64,
    pub expected_annual_premium: f64,
    #[serde(default)]
    pub url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgramResponse {
    pub id: Uuid,
    pub name: String,
    pub institution: String,
    pub level: String,
    pub field: String,
    pub country: String,
    pub duration_years: f64,
    pub tuition: f64,
    pub living_cost_per_year: f64,
    pub opportunity_cost_per_year: f64,
    pub expected_annual_premium: f64,
    pub url: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateScoreRequest {
    pub horizon_years: f64,
    pub routine: f64,
    pub social: f64,
    pub physical: f64,
    pub licensed: bool,
    pub current_automation: f64,
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

pub fn validate_program(req: &CreateProgramRequest) -> Result<(), String> {
    if req.name.trim().is_empty() || req.name.trim().chars().count() > 255 {
        return Err("name is required".to_string());
    }
    if req.institution.trim().is_empty() || req.institution.trim().chars().count() > 255 {
        return Err("institution is required".to_string());
    }
    if !LEVELS.contains(&req.level.as_str()) {
        return Err("level must be high_school, bachelor, master, phd, or other".to_string());
    }
    if !req.duration_years.is_finite() || req.duration_years <= 0.0 {
        return Err("duration_years must be greater than 0".to_string());
    }
    for (label, value) in [
        ("tuition", req.tuition),
        ("living_cost_per_year", req.living_cost_per_year),
        ("opportunity_cost_per_year", req.opportunity_cost_per_year),
    ] {
        if !value.is_finite() || value < 0.0 {
            return Err(format!("{label} must be zero or greater"));
        }
    }
    if !req.expected_annual_premium.is_finite() {
        return Err("expected_annual_premium must be a finite number".to_string());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_request() -> CreateProgramRequest {
        CreateProgramRequest {
            name: "Computer Science".into(),
            institution: "Example University".into(),
            level: "bachelor".into(),
            field: "computing".into(),
            country: "TW".into(),
            duration_years: 4.0,
            tuition: 10000.0,
            living_cost_per_year: 8000.0,
            opportunity_cost_per_year: 20000.0,
            expected_annual_premium: 15000.0,
            url: "https://example.edu/cs".into(),
        }
    }

    #[test]
    fn accepts_a_complete_program() {
        assert!(validate_program(&valid_request()).is_ok());
    }

    #[test]
    fn rejects_unknown_level_zero_duration_and_blank_name() {
        let mut req = valid_request();
        req.level = "certificate".into();
        assert!(validate_program(&req).is_err());

        let mut req = valid_request();
        req.duration_years = 0.0;
        assert!(validate_program(&req).is_err());

        let mut req = valid_request();
        req.name = "  ".into();
        assert!(validate_program(&req).is_err());

        let mut req = valid_request();
        req.tuition = -1.0;
        assert!(validate_program(&req).is_err());
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
