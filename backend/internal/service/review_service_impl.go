package service

import (
	"asset-store/internal/config"
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewServiceImpl struct {
	reviewRepo  repository.ReviewRepository
	productRepo repository.ProductRepository
	userRepo    repository.UserRepository
}

func NewReviewServiceImpl(reviewRepo repository.ReviewRepository, productRepo repository.ProductRepository, userRepo repository.UserRepository) ReviewService {
	return &ReviewServiceImpl{reviewRepo, productRepo, userRepo}
}

// CreateReview implements [ReviewService].
func (r *ReviewServiceImpl) CreateReview(req dto.CreateReviewRequest, productID uuid.UUID, userID uuid.UUID) (dto.ReviewResponse, error) {
	var newReview model.Review

	user, err := r.userRepo.GetUserByID(userID)
	if err != nil {
		return dto.ReviewResponse{}, errors.New("User not found")
	}

	if req.Rating < 1 || req.Rating > 5 {
		return dto.ReviewResponse{}, errors.New("Invalid rating")
	}

	product, err := r.productRepo.GetProductByID(productID)
	if err != nil {
		return dto.ReviewResponse{}, errors.New("Product not found")
	}

	if product.UserID == userID {
		return dto.ReviewResponse{}, errors.New("You cannot review your own product")
	}

	_, err = r.reviewRepo.GetReviewByUserIDAndProductID(userID, productID)
	if err == nil {
		return dto.ReviewResponse{}, errors.New("You already reviewed this product")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return dto.ReviewResponse{}, err
	}

	newReview.Comment = req.Comment
	newReview.Rating = req.Rating
	newReview.ProductID = productID
	newReview.UserID = userID

	createdReview, err := r.reviewRepo.CreateReview(newReview)
	if err != nil {
		return dto.ReviewResponse{}, err
	}

	config.RedisClient.Del(config.Ctx, "product:"+productID.String())

	return dto.ReviewResponse{
		ID:           createdReview.ID.String(),
		Rating:       createdReview.Rating,
		Comment:      createdReview.Comment,
		ReviewerName: user.Name,
		CreatedAt:    createdReview.GormModel.CreatedAt.Format(time.RFC3339),
	}, nil
}

// GetReviewByProductID implements [ReviewService].
func (r *ReviewServiceImpl) GetReviewByProductID(productID uuid.UUID) ([]dto.ReviewResponse, error) {
	var responses []dto.ReviewResponse

	reviews, err := r.reviewRepo.GetReviewsByProductID(productID)
	if err != nil {
		return nil, err
	}

	for _, review := range reviews {
		responses = append(responses, dto.ReviewResponse{
			ID:           review.ID.String(),
			Rating:       review.Rating,
			Comment:      review.Comment,
			ReviewerName: review.User.Name,
			CreatedAt:    review.GormModel.CreatedAt.Format(time.RFC3339),
		})
	}

	return responses, nil
}

// UpdateReview implements [ReviewService].
func (r *ReviewServiceImpl) UpdateReview(req dto.CreateReviewRequest, reviewID uuid.UUID, userID uuid.UUID) (dto.ReviewResponse, error) {
	review, err := r.reviewRepo.GetReviewByID(reviewID)
	if err != nil {
		return dto.ReviewResponse{}, err
	}

	if review.UserID != userID {
		return dto.ReviewResponse{}, errors.New("unauthorized")
	}

	if req.Rating < 1 || req.Rating > 5 {
		return dto.ReviewResponse{}, errors.New("invalid rating")
	}

	review.Comment = req.Comment
	review.Rating = req.Rating

	updatedReview, err := r.reviewRepo.EditReview(review)
	if err != nil {
		return dto.ReviewResponse{}, err
	}

	config.RedisClient.Del(config.Ctx, "product:"+review.ProductID.String())

	return dto.ReviewResponse{
		ID:           updatedReview.ID.String(),
		Rating:       updatedReview.Rating,
		Comment:      updatedReview.Comment,
		ReviewerName: updatedReview.User.Name,
		CreatedAt:    updatedReview.GormModel.CreatedAt.Format(time.RFC3339),
	}, nil

}

// DeleteReview implements [ReviewService].
func (r *ReviewServiceImpl) DeleteReview(id uuid.UUID, userID uuid.UUID) error {
	review, err := r.reviewRepo.GetReviewByID(id)
	if err != nil {
		return err
	}

	if review.UserID != userID {
		return errors.New("unauthorized")
	}

	err = r.reviewRepo.DeleteReview(id)
	if err != nil {
		return err
	}

	config.RedisClient.Del(config.Ctx, "product:"+review.ProductID.String())

	return nil
}
