package service

import (
	"asset-store/internal/config"
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ProductServiceImpl struct {
	productRepo repository.ProductRepository
	userRepo    repository.UserRepository
	reviewRepo  repository.ReviewRepository
}

func NewProductServiceImpl(productRepo repository.ProductRepository, userRepo repository.UserRepository, reviewRepo repository.ReviewRepository) ProductService {
	return &ProductServiceImpl{productRepo, userRepo, reviewRepo}
}

func (s *ProductServiceImpl) CreateProduct(req dto.CreateProductRequest, userID uuid.UUID) (dto.ProductResponse, error) {

	parsedCategoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return dto.ProductResponse{}, errors.New("Invalid Category ID Format")
	}

	newProduct := model.Product{
		UserID:        userID,
		Title:         req.Title,
		Description:   req.Description,
		Price:         req.Price,
		ThumbnailURL:  req.ThumbnailURL,
		AssetFileKey:  req.AssetFileURL,
		CategoryID:    &parsedCategoryID,
		AssetFileSize: req.AssetFileSize,
		AssetFileType: req.AssetFileType,
	}

	newProduct, err = s.productRepo.Create(newProduct)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	user, err := s.userRepo.GetUserByID(userID)
	if err == nil && user.Role == "buyer" {
		_ = s.userRepo.UpdateRole(userID, "seller")
	}

	response := dto.ProductResponse{
		ID:           newProduct.ID.String(),
		Title:        newProduct.Title,
		Description:  newProduct.Description,
		Price:        newProduct.Price,
		ThumbnailURL: newProduct.ThumbnailURL,
		SellerID:     newProduct.UserID.String(),
		SellerName:   user.Name,
	}

	cacheKey := "product:" + newProduct.ID.String()
	productJSON, _ := json.Marshal(response)
	config.RedisClient.Set(config.Ctx, cacheKey, string(productJSON), 1*time.Hour)

	s.clearProductsListCache()

	return response, nil
}

func (s *ProductServiceImpl) GetAllProducts(searchQuery string, limit int) ([]dto.ProductResponse, error) {
	cacheKey := fmt.Sprintf("products:search:%s:limit:%d", searchQuery, limit)

	var productResponses []dto.ProductResponse

	cachedData, err := config.RedisClient.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		json.Unmarshal([]byte(cachedData), &productResponses)
		return productResponses, nil
	}

	products, err := s.productRepo.GetAllProduct(searchQuery, limit)
	if err != nil {
		return nil, err
	}

	for _, product := range products {
		rating, _ := s.reviewRepo.GetAverageRating(product.ID)
		totalReviews, _ := s.reviewRepo.CountTotalReviewsByProductID(product.ID)
		productResponses = append(productResponses, dto.ProductResponse{
			ID:            product.ID.String(),
			Title:         product.Title,
			Description:   product.Description,
			Price:         product.Price,
			ThumbnailURL:  product.ThumbnailURL,
			AssetFileKey:  product.AssetFileKey,
			SellerID:      product.UserID.String(),
			SellerName:    product.User.Name,
			CategoryName:  product.Category.Name,
			AverageRating: rating,
			TotalReviews:  int(totalReviews),
		})
	}

	productJSON, _ := json.Marshal(productResponses)
	config.RedisClient.Set(config.Ctx, cacheKey, string(productJSON), 1*time.Hour)

	return productResponses, nil
}

func (s *ProductServiceImpl) GetProductByID(id uuid.UUID) (dto.ProductResponse, error) {
	cacheKey := "product:" + id.String()

	cachedData, err := config.RedisClient.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		var response dto.ProductResponse
		json.Unmarshal([]byte(cachedData), &response)
		return response, nil
	}

	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	rating, _ := s.reviewRepo.GetAverageRating(id)
	totalReviews, _ := s.reviewRepo.CountTotalReviewsByProductID(id)

	response := dto.ProductResponse{
		ID:            product.ID.String(),
		Title:         product.Title,
		Description:   product.Description,
		Price:         product.Price,
		ThumbnailURL:  product.ThumbnailURL,
		AssetFileKey:  product.AssetFileKey,
		SellerID:      product.UserID.String(),
		SellerName:    product.User.Name,
		CategoryName:  product.Category.Name,
		AverageRating: rating,
		TotalReviews:  int(totalReviews),

		AssetFileSize: product.AssetFileSize,
		AssetFileType: product.AssetFileType,
	}

	productJSON, _ := json.Marshal(response)
	config.RedisClient.Set(config.Ctx, cacheKey, string(productJSON), 1*time.Hour)

	return response, nil
}

func (s *ProductServiceImpl) GetProductsBySeller(userID uuid.UUID) ([]dto.ProductResponse, error) {
	products, err := s.productRepo.GetProductByUserID(userID)
	if err != nil {
		return nil, err
	}

	var responses []dto.ProductResponse
	for _, product := range products {
		rating, _ := s.reviewRepo.GetAverageRating(product.ID)
		totalReviews, _ := s.reviewRepo.CountTotalReviewsByProductID(product.ID)
		responses = append(responses, dto.ProductResponse{
			ID:            product.ID.String(),
			Title:         product.Title,
			Description:   product.Description,
			Price:         product.Price,
			ThumbnailURL:  product.ThumbnailURL,
			AssetFileKey:  product.AssetFileKey,
			SellerID:      product.UserID.String(),
			SellerName:    product.User.Name,
			CategoryName:  product.Category.Name,
			AverageRating: rating,
			TotalReviews:  int(totalReviews),
		})
	}

	return responses, nil
}

func (s *ProductServiceImpl) UpdateProduct(id uuid.UUID, req dto.UpdateProductRequest, userID uuid.UUID) (dto.ProductResponse, error) {
	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	if product.UserID != userID {
		return dto.ProductResponse{}, errors.New("Unauthorized: You are not the owner of this product")
	}

	parsedCategoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return dto.ProductResponse{}, errors.New("Invalid Category ID Format")
	}

	product.Title = req.Title
	product.Description = req.Description
	product.Price = req.Price
	product.CategoryID = &parsedCategoryID
	if req.ThumbnailURL != "" {
		product.ThumbnailURL = req.ThumbnailURL
	}
	if req.AssetFileURL != "" {
		product.AssetFileKey = req.AssetFileURL
		product.AssetFileSize = req.AssetFileSize
		product.AssetFileType = req.AssetFileType
	}

	updatedProduct, err := s.productRepo.UpdateProduct(product)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	cacheKey := "product:" + id.String()
	config.RedisClient.Del(config.Ctx, cacheKey)

	s.clearProductsListCache()

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

func (s *ProductServiceImpl) DeleteProduct(id uuid.UUID, userID uuid.UUID) error {
	product, err := s.productRepo.GetProductByID(id)
	if err != nil {
		return err
	}

	if product.UserID != userID {
		return errors.New("Unauthorized: You are not the owner of this product")
	}

	err = s.productRepo.DeleteProduct(id)
	if err != nil {
		return err
	}

	cacheKey := "product:" + id.String()
	config.RedisClient.Del(config.Ctx, cacheKey)

	s.clearProductsListCache()

	return nil
}

// Save Product Implementation
func (s *ProductServiceImpl) ToggleSaveProduct(userID, productID uuid.UUID) (string, error) {
	isSaved, err := s.productRepo.ToggleSaveProduct(userID, productID)
	if err != nil {
		return "", err
	}

	if isSaved {
		return "Product saved", nil
	}
	return "Product removed", nil
}

func (s *ProductServiceImpl) GetSavedProducts(userID uuid.UUID) ([]dto.ProductResponse, error) {
	savedItems, err := s.productRepo.GetSavedProducts(userID)
	if err != nil {
		return nil, err
	}

	var responses []dto.ProductResponse
	for _, item := range savedItems {
		if item.Product != nil {
			rating, _ := s.reviewRepo.GetAverageRating(item.Product.ID)
			totalReviews, _ := s.reviewRepo.CountTotalReviewsByProductID(item.Product.ID)
			responses = append(responses, dto.ProductResponse{
				ID:            item.Product.ID.String(),
				Title:         item.Product.Title,
				Description:   item.Product.Description,
				Price:         item.Product.Price,
				ThumbnailURL:  item.Product.ThumbnailURL,
				AssetFileKey:  item.Product.AssetFileKey,
				SellerID:      item.Product.UserID.String(),
				SellerName:    item.Product.User.Name,
				CategoryName:  item.Product.Category.Name,
				AverageRating: rating,
				TotalReviews:  int(totalReviews),
			})
		}
	}

	return responses, nil
}

func (s *ProductServiceImpl) GetSavedProductIDs(userID uuid.UUID) ([]string, error) {
	return s.productRepo.GetSavedProductIDs(userID)
}

// redis clear get all search cache
func (s *ProductServiceImpl) clearProductsListCache() {
	keys, err := config.RedisClient.Keys(config.Ctx, "products:search:*").Result()
	if err == nil && len(keys) > 0 {
		config.RedisClient.Del(config.Ctx, keys...)
	}
}
