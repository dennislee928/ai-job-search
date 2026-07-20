package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
	// Mock login logic
	c.JSON(http.StatusOK, gin.H{"token": "mock-jwt-token"})
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
