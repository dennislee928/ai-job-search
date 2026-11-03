use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::dto::{validate_program, CreateProgramRequest, ProgramResponse, ScoreResponse};
use crate::error::ApiError;
use crate::repo;

pub async fn create_program(
    State(pool): State<PgPool>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<CreateProgramRequest>,
) -> Result<Json<ProgramResponse>, ApiError> {
    validate_program(&body).map_err(ApiError::BadRequest)?;
    let program = repo::insert_program(&pool, user.id, &body).await?;
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
