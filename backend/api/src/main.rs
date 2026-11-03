mod auth;
mod catalog;
mod dto;
mod error;
mod programs;
mod repo;
mod upstream;

use std::time::Duration;

use axum::{
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use sqlx::postgres::PgPoolOptions;

use auth::{login, profile, AppState};
use programs::{create_program, create_score, get_program, list_programs, list_scores};
use upstream::{search_programs, upload_resume};

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://admin:admin@localhost:5432/university_search".to_string());
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("connect to postgres");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("apply migrations");

    let http = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(3))
        .timeout(Duration::from_secs(8))
        .build()
        .expect("http client");
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/auth/profile", get(profile))
        .route("/api/v1/programs/search", post(search_programs))
        .route("/api/v1/files/resume", post(upload_resume))
        .route("/api/v1/programs", post(create_program).get(list_programs))
        .route("/api/v1/programs/{id}", get(get_program))
        .route(
            "/api/v1/programs/{id}/scores",
            get(list_scores).post(create_score),
        )
        .with_state(AppState {
            pool,
            http,
            ai_service_url: std::env::var("AI_SERVICE_URL")
                .unwrap_or_else(|_| "http://ai-service:8000".to_string()),
            catalog_api_url: std::env::var("CATALOG_API_URL").unwrap_or_default(),
        });

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("bind 0.0.0.0:8080");
    axum::serve(listener, app).await.expect("axum serve");
}
