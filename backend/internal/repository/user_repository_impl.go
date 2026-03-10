package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepositoryImpl(db *gorm.DB) UserRepository {
	return &UserRepositoryImpl{db}
}

func (r *UserRepositoryImpl) CreateUser(user model.User) (model.User, error) {
	return user, r.db.Create(&user).Error
}

func (r *UserRepositoryImpl) GetUserByEmail(email string) (model.User, error) {
	var user model.User
	return user, r.db.Where("email = ?", email).First(&user).Error
}

func (r *UserRepositoryImpl) GetUserByID(id uuid.UUID) (model.User, error) {
	var user model.User
	return user, r.db.Where("id = ?", id).First(&user).Error
}

func (r *UserRepositoryImpl) UpdateUser(newName string, id uuid.UUID) error {
	return r.db.Model(&model.User{}).Where("id = ?", id).Update("name", newName).Error
}

func (r *UserRepositoryImpl) UpdateRole(id uuid.UUID, role string) error {
	return r.db.Model(&model.User{}).Where("id = ?", id).Update("role", role).Error
}

// GetUserProfileWithProducts implements [UserRepository].
func (r *UserRepositoryImpl) GetUserProfileWithProducts(id uuid.UUID) (model.User, error) {
	var user model.User

	return user, r.db.Preload("Products.Category").Where("id = ?", id).First(&user).Error
}
