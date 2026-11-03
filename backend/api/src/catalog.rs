use std::time::Duration;

use reqwest::Client;
use serde::Deserialize;

use crate::error::ApiError;

#[derive(Debug, Clone, Deserialize)]
pub struct CatalogProgram {
    pub tuition: Option<f64>,
    pub living_cost_per_year: Option<f64>,
    pub duration_years: Option<f64>,
    pub opportunity_cost_per_year: Option<f64>,
    pub expected_annual_premium: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct CatalogResponse {
    #[serde(default)]
    programs: Vec<CatalogProgram>,
}

/// Looks up a program in an external catalog.
///
/// An empty base URL skips the network. Server errors are retried twice.
/// A client error is returned immediately and must not be stored as a score.
pub async fn lookup_program(
    client: &Client,
    base_url: &str,
    name: &str,
    institution: &str,
) -> Result<Option<CatalogProgram>, ApiError> {
    let base = base_url.trim().trim_end_matches('/');
    if base.is_empty() {
        return Ok(None);
    }
    let url = format!("{base}/programs");
    let mut attempts = 0u8;
    loop {
        attempts += 1;
        let result = client
            .get(&url)
            .query(&[("name", name), ("institution", institution)])
            .timeout(Duration::from_secs(3))
            .send()
            .await;
        match result {
            Ok(response) if response.status().is_success() => {
                let body: CatalogResponse = response.json().await.map_err(|err| {
                    eprintln!("catalog response was not json: {err}");
                    ApiError::BadGateway("catalog response was not json".to_string())
                })?;
                return Ok(body.programs.into_iter().next());
            }
            Ok(response) if response.status().is_client_error() => {
                eprintln!("catalog rejected the lookup: {}", response.status());
                return Err(ApiError::BadGateway(
                    "catalog rejected the lookup".to_string(),
                ));
            }
            Ok(response) => {
                eprintln!("catalog lookup failed: {}", response.status());
            }
            Err(err) => {
                eprintln!("catalog lookup failed: {err}");
            }
        }
        if attempts >= 3 {
            return Err(ApiError::BadGateway("catalog lookup failed".to_string()));
        }
        tokio::time::sleep(Duration::from_millis(20 * u64::from(attempts))).await;
    }
}

#[cfg(test)]
mod tests {
    use std::sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    };

    use axum::{extract::State, response::IntoResponse, routing::get, Json, Router};
    use serde_json::json;

    use super::*;

    #[tokio::test]
    async fn empty_base_url_does_not_call_the_network() {
        let client = Client::new();
        let found = lookup_program(&client, "  ", "CS", "Example")
            .await
            .unwrap();
        assert!(found.is_none());
    }

    #[tokio::test]
    async fn retries_server_errors_then_reads_the_program() {
        let hits = Arc::new(AtomicUsize::new(0));
        let app = Router::new()
            .route("/programs", get(flaky))
            .with_state(hits.clone());
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        let found = lookup_program(&Client::new(), &format!("http://{addr}"), "CS", "Example")
            .await
            .unwrap();
        assert_eq!(hits.load(Ordering::SeqCst), 3);
        assert_eq!(found.unwrap().tuition, Some(12000.0));
    }

    #[tokio::test]
    async fn client_error_is_not_retried() {
        let hits = Arc::new(AtomicUsize::new(0));
        let app = Router::new()
            .route("/programs", get(reject))
            .with_state(hits.clone());
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        let err = lookup_program(&Client::new(), &format!("http://{addr}"), "CS", "Example")
            .await
            .unwrap_err();
        assert!(matches!(err, ApiError::BadGateway(_)));
        assert_eq!(hits.load(Ordering::SeqCst), 1);
    }

    async fn flaky(State(hits): State<Arc<AtomicUsize>>) -> axum::response::Response {
        let seen = hits.fetch_add(1, Ordering::SeqCst);
        if seen < 2 {
            return axum::http::StatusCode::BAD_GATEWAY.into_response();
        }
        Json(json!({"programs": [{"tuition": 12000.0}]})).into_response()
    }

    async fn reject(State(hits): State<Arc<AtomicUsize>>) -> axum::http::StatusCode {
        hits.fetch_add(1, Ordering::SeqCst);
        axum::http::StatusCode::BAD_REQUEST
    }
}
