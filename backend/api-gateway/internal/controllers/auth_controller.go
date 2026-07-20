package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"api-gateway/internal/db"
	"api-gateway/internal/models"
)

type AuthController struct{}

// Login handles the user login
// @Summary User Login
// @Description Authenticates a user and returns a token
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/v1/auth/login [post]
func (ac *AuthController) Login(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := models.User{
		Email:     input.Email,
		FirstName: "Mock",
		LastName:  "User",
		Role:      "candidate",
	}

	// Insert or find the user in PostgreSQL
	result := db.DB.Where("email = ?", user.Email).FirstOrCreate(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": "mock-jwt-token-for-" + user.Email, "id": user.ID})
}

// Profile returns the current user profile
// @Summary Get Profile
// @Description Returns the profile of the authenticated user
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/v1/auth/profile [get]
func (ac *AuthController) Profile(c *gin.Context) {
	// Mock profile logic
	c.JSON(http.StatusOK, gin.H{"email": "user@example.com", "role": "candidate"})
}
