package config

import "os"

type Config struct {
	DatabaseURL string
	ServerPort  string
}

func LoadConfig() Config {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://admin:admin@localhost:5432/ai_job_search?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{
		DatabaseURL: dbUrl,
		ServerPort:  port,
	}
}
