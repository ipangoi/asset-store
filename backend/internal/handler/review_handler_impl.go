package handler

import (
	"asset-store/internal/dto"
	"asset-store/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReviewHandlerImpl struct {
	reviewService service.ReviewService
}

func NewReviewHandlerImpl(reviewService service.ReviewService) ReviewHandler {
	return &ReviewHandlerImpl{reviewService}
}

// CreateReview implements [ReviewHandler].
func (r *ReviewHandlerImpl) CreateReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	productID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req dto.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := r.reviewService.CreateReview(req, productID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, res)
}

// GetAllReviewByProduct implements [ReviewHandler].
func (r *ReviewHandlerImpl) GetAllReviewByProduct(c *gin.Context) {
	productID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	res, err := r.reviewService.GetReviewByProductID(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// UpdateReview implements [ReviewHandler].
func (r *ReviewHandlerImpl) UpdateReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	reviewID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review id"})
		return
	}

	var req dto.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := r.reviewService.UpdateReview(req, reviewID, userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to edit this review"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// DeleteReview implements [ReviewHandler].
func (r *ReviewHandlerImpl) DeleteReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	reviewID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review id"})
		return
	}

	err = r.reviewService.DeleteReview(reviewID, userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to delete this review"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}
