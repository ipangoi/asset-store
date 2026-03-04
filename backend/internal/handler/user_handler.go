package handler

import "github.com/gin-gonic/gin"

type UserHandler interface {
	Register(c *gin.Context)
	Login(c *gin.Context)
	GetProfileByID(c *gin.Context)
	UpdateProfile(c *gin.Context)
	UpdateRole(c *gin.Context)
}
