package handler

import "github.com/gin-gonic/gin"

type CategoryHandler interface {
	GetAllCategory(c *gin.Context)
}
