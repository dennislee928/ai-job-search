package routes

import (
	"api-gateway/internal/controllers"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP", "service": "api-gateway"})
	})

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	v1 := r.Group("/api/v1")
	{
		authController := &controllers.AuthController{}
		
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.GET("/profile", authController.Profile)
		}
	}

	return r
}
