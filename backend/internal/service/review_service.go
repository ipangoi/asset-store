package service

import (
	"asset-store/internal/dto"

	"github.com/google/uuid"
)

type ReviewService interface {
	CreateReview(req dto.CreateReviewRequest, productID uuid.UUID, userID uuid.UUID) (dto.ReviewResponse, error)
	GetReviewByProductID(productID uuid.UUID) ([]dto.ReviewResponse, error)
	UpdateReview(req dto.CreateReviewRequest, reviewID uuid.UUID, userID uuid.UUID) (dto.ReviewResponse, error)
	DeleteReview(id uuid.UUID, userID uuid.UUID) error
}
