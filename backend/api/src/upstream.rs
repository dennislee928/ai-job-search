use axum::{
    extract::{Multipart, State},
    Json,
};
use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};

use crate::auth::AppState;
use crate::auth::CurrentUser;
use crate::dto::{CreateScoreRequest, ProgramResponse, ProgramSearchRequest};
use crate::error::ApiError;
use crate::repo::NewScore;

#[derive(Debug, Deserialize)]
struct HorizonValues {
    years_10: f64,
    years_20: f64,
    years_30: f64,
}

#[derive(Debug, Deserialize)]
struct AiScore {
    cp_ratio: f64,
    payback_years: Option<f64>,
    ai_replacement: HorizonValues,
    career_outlook: HorizonValues,
    model_note: String,
}

pub fn score_payload(
    program: &ProgramResponse,
    request: &CreateScoreRequest,
    catalog_tuition: Option<f64>,
    catalog_living: Option<f64>,
    catalog_duration: Option<f64>,
    catalog_opportunity: Option<f64>,
    catalog_premium: Option<f64>,
) -> Value {
    json!({
        "tuition": catalog_tuition.unwrap_or(program.tuition),
        "living_cost_per_year": catalog_living.unwrap_or(program.living_cost_per_year),
        "duration_years": catalog_duration.unwrap_or(program.duration_years),
        "opportunity_cost_per_year": catalog_opportunity.unwrap_or(program.opportunity_cost_per_year),
        "expected_annual_premium": catalog_premium.unwrap_or(program.expected_annual_premium),
        "horizon_years": request.horizon_years,
        "routine": request.routine,
        "social": request.social,
        "physical": request.physical,
        "licensed": request.licensed,
        "current_automation": request.current_automation,
    })
}

pub async fn request_score(
    client: &Client,
    ai_service_url: &str,
    payload: &Value,
) -> Result<NewScore, ApiError> {
    let url = format!(
        "{}/api/v1/llm/programs/score",
        ai_service_url.trim_end_matches('/')
    );
    let response = client.post(url).json(payload).send().await.map_err(|err| {
        eprintln!("score request failed: {err}");
        ApiError::BadGateway("score request failed".to_string())
    })?;
    if response.status() == reqwest::StatusCode::BAD_REQUEST {
        let body: Value = response.json().await.unwrap_or_else(|_| json!({}));
        let detail = body
            .get("detail")
            .and_then(Value::as_str)
            .unwrap_or("score request was rejected")
            .to_string();
        return Err(ApiError::BadRequest(detail));
    }
    if !response.status().is_success() {
        eprintln!("score request failed: {}", response.status());
        return Err(ApiError::BadGateway("score request failed".to_string()));
    }
    let score: AiScore = response.json().await.map_err(|err| {
        eprintln!("score response was not json: {err}");
        ApiError::BadGateway("score response was not json".to_string())
    })?;
    Ok(NewScore {
        inputs: payload.clone(),
        cp_ratio: score.cp_ratio,
        payback_years: score.payback_years,
        ai_replacement_10: score.ai_replacement.years_10,
        ai_replacement_20: score.ai_replacement.years_20,
        ai_replacement_30: score.ai_replacement.years_30,
        career_outlook_10: score.career_outlook.years_10,
        career_outlook_20: score.career_outlook.years_20,
        career_outlook_30: score.career_outlook.years_30,
        model_note: score.model_note,
    })
}

pub async fn search_programs(
    State(state): State<AppState>,
    CurrentUser(_user): CurrentUser,
    Json(body): Json<ProgramSearchRequest>,
) -> Result<Json<Value>, ApiError> {
    if body.query.trim().is_empty() {
        return Err(ApiError::BadRequest("query is required".to_string()));
    }
    let limit = body.limit.clamp(1, 20);
    let url = format!(
        "{}/api/v1/llm/programs/search",
        state.ai_service_url.trim_end_matches('/')
    );
    let response = state
        .http
        .post(url)
        .json(&json!({ "query": body.query.trim(), "limit": limit }))
        .send()
        .await
        .map_err(|err| {
            eprintln!("program search failed: {err}");
            ApiError::BadGateway("program search failed".to_string())
        })?;
    if !response.status().is_success() {
        eprintln!("program search failed: {}", response.status());
        return Err(ApiError::BadGateway("program search failed".to_string()));
    }
    let matches: Value = response.json().await.map_err(|err| {
        eprintln!("program search response was not json: {err}");
        ApiError::BadGateway("program search response was not json".to_string())
    })?;
    Ok(Json(matches))
}

pub async fn upload_resume(
    State(state): State<AppState>,
    CurrentUser(_user): CurrentUser,
    mut multipart: Multipart,
) -> Result<Json<Value>, ApiError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|_| ApiError::BadRequest("file is required".to_string()))?
        .ok_or_else(|| ApiError::BadRequest("file is required".to_string()))?;
    if field.name() != Some("file") {
        return Err(ApiError::BadRequest("file is required".to_string()));
    }
    let file_name = field.file_name().unwrap_or("upload.bin").to_string();
    let bytes = field
        .bytes()
        .await
        .map_err(|_| ApiError::BadRequest("file is required".to_string()))?;
    let part = reqwest::multipart::Part::bytes(bytes.to_vec()).file_name(file_name);
    let form = reqwest::multipart::Form::new().part("file", part);
    let url = format!(
        "{}/api/v1/llm/upload/resume",
        state.ai_service_url.trim_end_matches('/')
    );
    let response = state
        .http
        .post(url)
        .multipart(form)
        .send()
        .await
        .map_err(|err| {
            eprintln!("resume upload failed: {err}");
            ApiError::BadGateway("resume upload failed".to_string())
        })?;
    if !response.status().is_success() {
        eprintln!("resume upload failed: {}", response.status());
        return Err(ApiError::BadGateway("resume upload failed".to_string()));
    }
    let body: Value = response.json().await.map_err(|err| {
        eprintln!("resume upload response was not json: {err}");
        ApiError::BadGateway("resume upload response was not json".to_string())
    })?;
    Ok(Json(body))
}
