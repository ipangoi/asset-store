package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
)

type ReviewRepository interface {
	CreateReview(review model.Review) (model.Review, error)
	GetReviewsByProductID(productID uuid.UUID) ([]model.Review, error)
	GetAverageRating(productID uuid.UUID) (float64, error)
	CountTotalReviewsByProductID(productID uuid.UUID) (int64, error)

	GetReviewByID(id uuid.UUID) (model.Review, error)
	EditReview(review model.Review) (model.Review, error)
	DeleteReview(id uuid.UUID) error
}
