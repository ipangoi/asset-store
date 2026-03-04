package service

import (
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"errors"

	"github.com/google/uuid"
)

type productServiceImpl struct {
	productRepo repository.ProductRepository
	userRepo    repository.UserRepository
}

func NewProductServiceImpl(productRepo repository.ProductRepository, userRepo repository.UserRepository) ProductService {
	return &productServiceImpl{productRepo, userRepo}
}

func (s *productServiceImpl) CreateProduct(title, desc string, price int, thumbnailUrl, assetKey string, userID uuid.UUID) (dto.ProductResponse, error) {

	newProduct := model.Product{
		UserID:       userID,
		Title:        title,
		Description:  desc,
		Price:        price,
		ThumbnailURL: thumbnailUrl,
		AssetFileKey: assetKey,
	}

	newProduct, err := s.productRepo.Create(newProduct)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	user, err := s.userRepo.GetUserByID(userID)
	if err == nil && user.Role == "buyer" {
		_ = s.userRepo.UpdateRole(userID, "seller")
	}

	return dto.ProductResponse{
		ID:           newProduct.ID.String(),
		Title:        newProduct.Title,
		Description:  newProduct.Description,
		Price:        newProduct.Price,
		ThumbnailURL: newProduct.ThumbnailURL,
		SellerID:     newProduct.UserID.String(),
	}, nil
}

func (s *productServiceImpl) GetAllProducts(searchQuery string, limit int) ([]dto.ProductResponse, error) {
	products, err := s.productRepo.GetAllProduct(searchQuery, limit)
	if err != nil {
		return nil, err
	}

	var productResponses []dto.ProductResponse
	for _, product := range products {
		productResponses = append(productResponses, dto.ProductResponse{
			ID:           product.ID.String(),
			Title:        product.Title,
			Description:  product.Description,
			Price:        product.Price,
			ThumbnailURL: product.ThumbnailURL,
			AssetFileKey: product.AssetFileKey,
			SellerID:     product.UserID.String(),
			SellerName:   product.User.Name,
		})
	}

	return productResponses, nil
}

func (s *productServiceImpl) GetProductByID(id uuid.UUID) (dto.ProductResponse, error) {
	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	return dto.ProductResponse{
		ID:           product.ID.String(),
		Title:        product.Title,
		Description:  product.Description,
		Price:        product.Price,
		ThumbnailURL: product.ThumbnailURL,
		AssetFileKey: product.AssetFileKey,
		SellerID:     product.UserID.String(),
		SellerName:   product.User.Name,
	}, nil
}

func (s *productServiceImpl) GetProductsBySeller(userID uuid.UUID) ([]dto.ProductResponse, error) {
	products, err := s.productRepo.GetProductByUserID(userID)
	if err != nil {
		return nil, err
	}

	var responses []dto.ProductResponse
	for _, product := range products {
		responses = append(responses, dto.ProductResponse{
			ID:           product.ID.String(),
			Title:        product.Title,
			Description:  product.Description,
			Price:        product.Price,
			ThumbnailURL: product.ThumbnailURL,
			AssetFileKey: product.AssetFileKey,
			SellerID:     product.UserID.String(),
			SellerName:   product.User.Name,
		})
	}

	return responses, nil
}

func (s *productServiceImpl) UpdateProduct(id uuid.UUID, req dto.UpdateProductRequest, userID uuid.UUID) (dto.ProductResponse, error) {
	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	if product.UserID != userID {
		return dto.ProductResponse{}, errors.New("Unauthorized: You are not the owner of this product")
	}

	product.Title = req.Title
	product.Description = req.Description
	product.Price = req.Price
	if req.ThumbnailURL != "" {
		product.ThumbnailURL = req.ThumbnailURL
	}
	if req.AssetFileURL != "" {
		product.AssetFileKey = req.AssetFileURL
	}

	updatedProduct, err := s.productRepo.UpdateProduct(product)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	return dto.ProductResponse{
		ID:           updatedProduct.ID.String(),
		Title:        updatedProduct.Title,
		Description:  updatedProduct.Description,
		Price:        updatedProduct.Price,
		ThumbnailURL: updatedProduct.ThumbnailURL,
		SellerID:     updatedProduct.UserID.String(),
		SellerName:   updatedProduct.User.Name,
	}, nil
}

func (s *productServiceImpl) DeleteProduct(id uuid.UUID, userID uuid.UUID) error {
	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return err
	}

	if product.UserID != userID {
		return errors.New("Unauthorized: You are not the owner of this product")
	}

	return s.productRepo.DeleteProduct(id)
}

// Save Product Implementation
func (s *productServiceImpl) ToggleSaveProduct(userID, productID uuid.UUID) (string, error) {
	isSaved, err := s.productRepo.ToggleSaveProduct(userID, productID)
	if err != nil {
		return "", err
	}

	if isSaved {
		return "Product saved", nil
	}
	return "Product removed", nil
}

func (s *productServiceImpl) GetSavedProducts(userID uuid.UUID) ([]dto.ProductResponse, error) {
	savedItems, err := s.productRepo.GetSavedProducts(userID)
	if err != nil {
		return nil, err
	}

	var responses []dto.ProductResponse
	for _, item := range savedItems {
		if item.Product != nil {
			responses = append(responses, dto.ProductResponse{
				ID:           item.Product.ID.String(),
				Title:        item.Product.Title,
				Description:  item.Product.Description,
				Price:        item.Product.Price,
				ThumbnailURL: item.Product.ThumbnailURL,
				AssetFileKey: item.Product.AssetFileKey,
				SellerID:     item.Product.UserID.String(),
				SellerName:   item.Product.User.Name,
			})
		}
	}

	return responses, nil
}

func (s *productServiceImpl) GetSavedProductIDs(userID uuid.UUID) ([]string, error) {
	return s.productRepo.GetSavedProductIDs(userID)
}
