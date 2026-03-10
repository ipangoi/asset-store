package service

import (
	"asset-store/internal/config"
	"asset-store/internal/dto"
	"asset-store/internal/repository"
	"encoding/json"
	"time"
)

type CategoryServiceImpl struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryServiceImpl(categoryRepo repository.CategoryRepository) CategoryService {
	return &CategoryServiceImpl{categoryRepo}
}

// GetAllCategory implements [CategoryService].
func (c *CategoryServiceImpl) GetAllCategory() ([]dto.CategoryResponse, error) {
	cacheKey := "category:all"

	var categoryResponses []dto.CategoryResponse

	cachedData, err := config.RedisClient.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		json.Unmarshal([]byte(cachedData), &categoryResponses)
		return categoryResponses, nil
	}

	categories, err := c.categoryRepo.GetAllCategory()
	if err != nil {
		return nil, err
	}

	for _, category := range categories {
		categoryResponses = append(categoryResponses, dto.CategoryResponse{
			ID:   category.ID.String(),
			Name: category.Name,
			Slug: category.Slug,
		})
	}

	categoryJSON, _ := json.Marshal(categoryResponses)
	config.RedisClient.Set(config.Ctx, cacheKey, string(categoryJSON), 1*time.Hour)

	return categoryResponses, nil
}
