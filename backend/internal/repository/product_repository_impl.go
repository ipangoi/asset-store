package repository

import (
	"asset-store/internal/model"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductRepositoryImpl struct {
	db *gorm.DB
}

func NewProductRepositoryImpl(db *gorm.DB) ProductRepository {
	return &ProductRepositoryImpl{db}
}

// Create implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) Create(product model.Product) (model.Product, error) {
	return product, p.db.Create(&product).Error
}

// FindAll implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) GetAllProduct(searchQuery string, limit int) ([]model.Product, error) {
	var products []model.Product
	query := p.db.Preload("User").Preload("Category")

	if searchQuery != "" {
		keyword := "%" + searchQuery + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", keyword, keyword)
	}

	if limit > 0 {
		query = query.Limit(limit)
	}

	return products, query.Find(&products).Error
}

// FindByID implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) GetProductByID(id uuid.UUID) (model.Product, error) {
	var product model.Product
	return product, p.db.Preload("User").Preload("Category").Where("id = ?", id).First(&product).Error
}

// FindByUserID implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) GetProductByUserID(userID uuid.UUID) ([]model.Product, error) {
	var products []model.Product
	return products, p.db.Preload("User").Where("user_id = ?", userID).Find(&products).Error
}

// Delete implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) DeleteProduct(id uuid.UUID) error {
	return p.db.Where("id = ?", id).Delete(&model.Product{}).Error
}

// Update implements [ProductRepositoryImpl].
func (p *ProductRepositoryImpl) UpdateProduct(product model.Product) (model.Product, error) {
	return product, p.db.Save(&product).Error
}

// Save Product Implementation
func (p *ProductRepositoryImpl) ToggleSaveProduct(userID, productID uuid.UUID) (bool, error) {
	var saved model.SavedProduct
	err := p.db.Where("user_id = ? AND product_id = ?", userID, productID).First(&saved).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newSave := model.SavedProduct{
			UserID:    userID,
			ProductID: productID,
		}
		if err := p.db.Create(&newSave).Error; err != nil {
			return false, err
		}
		return true, nil
	} else if err != nil {
		return false, err
	}

	if err := p.db.Delete(&saved).Error; err != nil {
		return false, err
	}
	return false, nil
}

func (p *ProductRepositoryImpl) GetSavedProducts(userID uuid.UUID) ([]model.SavedProduct, error) {
	var savedProducts []model.SavedProduct
	err := p.db.Preload("Product").Preload("Product.User").Where("user_id = ?", userID).Find(&savedProducts).Error
	return savedProducts, err
}

func (p *ProductRepositoryImpl) GetSavedProductIDs(userID uuid.UUID) ([]string, error) {
	var savedProducts []model.SavedProduct
	err := p.db.Select("product_id").Where("user_id = ?", userID).Find(&savedProducts).Error

	var ids []string
	for _, saved := range savedProducts {
		ids = append(ids, saved.ProductID.String())
	}
	return ids, err
}
