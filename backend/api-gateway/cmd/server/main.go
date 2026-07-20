package main

import (
	"log"
	
	_ "api-gateway/docs" // Required for Swagger
	"api-gateway/internal/config"
	"api-gateway/internal/routes"
)

// @title AI Job Search API Gateway
// @version 1.0
// @description The core routing and authentication service for the AI Job Search platform.
// @host localhost:8080
// @BasePath /
func main() {
	cfg := config.LoadConfig()
	
	r := routes.SetupRouter()

	log.Printf("Starting API Gateway on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
