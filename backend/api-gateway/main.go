package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin" 
)

func main() {
	r := gin.Default()

	// API Gateway routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "UP",
			"service": "api-gateway",
		})
	})

	// Proxy routes will be implemented here to forward to FastAPI and Julia

	fmt.Println("Starting API Gateway on :8080")
	r.Run(":8080")
}
