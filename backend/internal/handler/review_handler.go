package handler

import "github.com/gin-gonic/gin"

type ReviewHandler interface {
	CreateReview(c *gin.Context)
	GetAllReviewByProduct(c *gin.Context)
	UpdateReview(c *gin.Context)
	DeleteReview(c *gin.Context)
}
