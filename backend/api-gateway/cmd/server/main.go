package main

import (
	"log"
	
	_ "api-gateway/docs" // Required for Swagger
	"api-gateway/internal/config"
	"api-gateway/internal/routes"
	"api-gateway/internal/db"
	"api-gateway/internal/auth"
)

// @title AI Job Search API Gateway
// @version 1.0
// @description The core routing and authentication service for the AI Job Search platform.
// @host localhost:8080
// @BasePath /
func main() {
	cfg := config.LoadConfig()
	
	// Initialize GORM Database
	if err := db.InitGORM(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Casbin RBAC
	if err := auth.InitCasbin(); err != nil {
		log.Fatalf("Failed to initialize Casbin: %v", err)
	}

	r := routes.SetupRouter()

	log.Printf("Starting API Gateway on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
