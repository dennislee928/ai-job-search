use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::AppState;
use crate::auth::CurrentUser;
use crate::catalog;
use crate::dto::{prepare_offer, CreateProgramRequest, ProgramResponse, ScoreResponse};
use crate::error::ApiError;
use crate::repo;
use crate::upstream::{request_score, score_payload};

pub async fn create_program(
    State(pool): State<PgPool>,
    CurrentUser(user): CurrentUser,
    Json(mut body): Json<CreateProgramRequest>,
) -> Result<Json<ProgramResponse>, ApiError> {
    let years = prepare_offer(&mut body).map_err(ApiError::BadRequest)?;
    let program = repo::insert_program(&pool, user.id, &body, years).await?;
    Ok(Json(program))
}

pub async fn list_programs(
    State(pool): State<PgPool>,
    CurrentUser(user): CurrentUser,
) -> Result<Json<Vec<ProgramResponse>>, ApiError> {
    Ok(Json(repo::list_programs(&pool, user.id).await?))
}

pub async fn get_program(
    State(pool): State<PgPool>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ProgramResponse>, ApiError> {
    Ok(Json(repo::find_program(&pool, user.id, id).await?))
}

pub async fn list_scores(
    State(pool): State<PgPool>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ScoreResponse>>, ApiError> {
    Ok(Json(repo::list_scores(&pool, user.id, id).await?))
}

pub async fn create_score(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ScoreResponse>, ApiError> {
    let program = repo::find_program(&state.pool, user.id, id).await?;
    let catalog_hit = catalog::lookup_program(
        &state.http,
        &state.catalog_api_url,
        &program.name,
        &program.institution,
    )
    .await?;
    let payload = score_payload(
        &program,
        catalog_hit.as_ref().and_then(|hit| hit.tuition),
        catalog_hit
            .as_ref()
            .and_then(|hit| hit.living_cost_per_year),
        catalog_hit.as_ref().and_then(|hit| hit.duration_years),
    );
    let score = request_score(&state.http, &state.ai_service_url, &payload).await?;
    let saved = repo::insert_score(&state.pool, program.id, score).await?;
    Ok(Json(saved))
}
