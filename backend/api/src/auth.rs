use axum::{
    extract::{FromRef, FromRequestParts},
    http::{header::AUTHORIZATION, request::Parts},
    Json,
};
use reqwest::Client;
use sqlx::PgPool;

use crate::dto::{
    email_from_authorization, normalize_email, token_for_email, LoginRequest, LoginResponse,
    ProfileResponse,
};
use crate::error::ApiError;
use crate::repo::{self, UserRow};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub http: Client,
    pub ai_service_url: String,
    pub catalog_api_url: String,
}

impl FromRef<AppState> for PgPool {
    fn from_ref(state: &AppState) -> PgPool {
        state.pool.clone()
    }
}

pub struct CurrentUser(pub UserRow);

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or(ApiError::Unauthorized)?;
        let email = email_from_authorization(header).ok_or(ApiError::Unauthorized)?;
        let user = repo::find_user_by_email(&state.pool, &email)
            .await?
            .ok_or(ApiError::Unauthorized)?;
        Ok(CurrentUser(user))
    }
}

pub async fn login(
    axum::extract::State(pool): axum::extract::State<PgPool>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    let email = normalize_email(&body.email).map_err(ApiError::BadRequest)?;
    let user = repo::upsert_user(&pool, &email).await?;
    Ok(Json(LoginResponse {
        token: token_for_email(&user.email),
        id: user.id,
    }))
}

pub async fn profile(CurrentUser(user): CurrentUser) -> Json<ProfileResponse> {
    Json(ProfileResponse {
        email: user.email,
        role: user.role,
    })
}
