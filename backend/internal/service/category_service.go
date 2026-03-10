package service

import "asset-store/internal/dto"

type CategoryService interface {
	GetAllCategory() ([]dto.CategoryResponse, error)
}
