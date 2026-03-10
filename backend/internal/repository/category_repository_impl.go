package repository

import (
	"asset-store/internal/model"

	"gorm.io/gorm"
)

type CategoryRepositoryImpl struct {
	db *gorm.DB
}

func NewCategoryRepositoryImpl(db *gorm.DB) CategoryRepository {
	return &CategoryRepositoryImpl{db}
}

// GetAllCategory implements [CategoryRepository].
func (c *CategoryRepositoryImpl) GetAllCategory() ([]model.Category, error) {
	var categories []model.Category

	return categories, c.db.Find(&categories).Error
}
