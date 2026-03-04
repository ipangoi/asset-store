package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
)

type ProductRepository interface {
	Create(product model.Product) (model.Product, error)
	GetAllProduct(searchQuery string, limit int) ([]model.Product, error)
	GetProductByID(id uuid.UUID) (model.Product, error)
	GetProductByUserID(userID uuid.UUID) ([]model.Product, error)
	DeleteProduct(id uuid.UUID) error
	UpdateProduct(product model.Product) (model.Product, error)

	ToggleSaveProduct(userID, productID uuid.UUID) (bool, error)
	GetSavedProducts(userID uuid.UUID) ([]model.SavedProduct, error)
	GetSavedProductIDs(userID uuid.UUID) ([]string, error)
}
