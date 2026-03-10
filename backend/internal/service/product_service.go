package service

import (
	"asset-store/internal/dto"

	"github.com/google/uuid"
)

type ProductService interface {
	CreateProduct(req dto.CreateProductRequest, userID uuid.UUID) (dto.ProductResponse, error)
	GetAllProducts(searchQuery string, limit int) ([]dto.ProductResponse, error)
	GetProductByID(id uuid.UUID) (dto.ProductResponse, error)
	GetProductsBySeller(userID uuid.UUID) ([]dto.ProductResponse, error)
	UpdateProduct(id uuid.UUID, product dto.UpdateProductRequest, userID uuid.UUID) (dto.ProductResponse, error)
	DeleteProduct(id uuid.UUID, userID uuid.UUID) error

	ToggleSaveProduct(userID, productID uuid.UUID) (string, error)
	GetSavedProducts(userID uuid.UUID) ([]dto.ProductResponse, error)
	GetSavedProductIDs(userID uuid.UUID) ([]string, error)
}
