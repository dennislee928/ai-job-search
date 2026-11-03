mod auth;
mod dto;
mod error;
mod programs;
mod repo;

use axum::{
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use sqlx::postgres::PgPoolOptions;

use auth::{login, profile, AppState};
use programs::{create_program, get_program, list_programs, list_scores};

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

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/auth/profile", get(profile))
        .route("/api/v1/programs", post(create_program).get(list_programs))
        .route("/api/v1/programs/{id}", get(get_program))
        .route("/api/v1/programs/{id}/scores", get(list_scores))
        .with_state(AppState { pool });

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("bind 0.0.0.0:8080");
    axum::serve(listener, app).await.expect("axum serve");
}
