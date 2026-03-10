package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewRepositoryImpl struct {
	db *gorm.DB
}

func NewReviewRepositoryImpl(db *gorm.DB) ReviewRepository {
	return &ReviewRepositoryImpl{db}
}

// CreateReview implements [ReviewRepository].
func (r *ReviewRepositoryImpl) CreateReview(review model.Review) (model.Review, error) {
	return review, r.db.Create(&review).Error
}

// GetReviewsByProductID implements [ReviewRepository].
func (r *ReviewRepositoryImpl) GetReviewsByProductID(productID uuid.UUID) ([]model.Review, error) {
	var reviews []model.Review

	return reviews, r.db.Preload("User").Where("product_id = ?", productID).Find(&reviews).Error
}

// GetAverageRating implements [ReviewRepository].
func (r *ReviewRepositoryImpl) GetAverageRating(productID uuid.UUID) (float64, error) {
	var result struct {
		Average float64
	}

	err := r.db.Model(&model.Review{}).Where("product_id = ?", productID).Select("COALESCE(AVG(rating), 0) as average").Scan(&result).Error

	return result.Average, err
}

// CountTotalReviewsByProductID implements [ReviewRepository].
func (r *ReviewRepositoryImpl) CountTotalReviewsByProductID(productID uuid.UUID) (int64, error) {
	var count int64

	err := r.db.Model(&model.Review{}).Where("product_id = ?", productID).Count(&count).Error

	return count, err
}

// GetReviewByID implements [ReviewRepository].
func (r *ReviewRepositoryImpl) GetReviewByID(id uuid.UUID) (model.Review, error) {
	var review model.Review

	return review, r.db.Preload("User").Where("id = ?", id).First(&review).Error
}

// EditReview implements [ReviewRepository].
func (r *ReviewRepositoryImpl) EditReview(review model.Review) (model.Review, error) {
	return review, r.db.Save(&review).Error
}

// DeleteReview implements [ReviewRepository].
func (r *ReviewRepositoryImpl) DeleteReview(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&model.Review{}).Error
}
