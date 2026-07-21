package auth

import (
	"log"

	"api-gateway/internal/db"
	"github.com/casbin/casbin/v3"
	"github.com/casbin/casbin/v3/model"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/gin-gonic/gin"
)

var Enforcer *casbin.Enforcer

// InitCasbin uses the global PostgreSQL DB via GORM and initializes Casbin policies.
func InitCasbin() error {
	// Initialize gorm adapter
	adapter, err := gormadapter.NewAdapterByDB(db.DB)
	if err != nil {
		return err
	}

	// The model defines how policies are structured (subject, object, action)
	m := model.NewModel()
	m.AddDef("r", "r", "sub, obj, act")
	m.AddDef("p", "p", "sub, obj, act")
	m.AddDef("g", "g", "_, _")
	m.AddDef("e", "e", "some(where (p.eft == allow))")
	m.AddDef("m", "m", "g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act")

	Enforcer, err = casbin.NewEnforcer(m, adapter)
	if err != nil {
		return err
	}

	err = Enforcer.LoadPolicy()
	if err != nil {
		return err
	}

	log.Println("Casbin RBAC initialized successfully")
	return nil
}

// RBACMiddleware intercepts Gin requests to enforce Casbin policies.
func RBACMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Example: get user role from JWT token (mocking it as 'candidate' for now)
		role := "candidate" // In a real app, extract this from Authorization header
		
		obj := c.Request.URL.Path
		act := c.Request.Method

		// Special case for public health check
		if obj == "/health" {
			c.Next()
			return
		}

		ok, err := Enforcer.Enforce(role, obj, act)
		if err != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Error occurred during authorization check"})
			return
		}

		if !ok {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden: You don't have access to this resource"})
			return
		}

		c.Next()
	}
}
