package repository

import "asset-store/internal/model"

type CategoryRepository interface {
	GetAllCategory() ([]model.Category, error)
}
