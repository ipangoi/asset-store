package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
)

type UserRepository interface {
	CreateUser(user model.User) (model.User, error)
	GetUserByEmail(email string) (model.User, error)
	GetUserByID(id uuid.UUID) (model.User, error)
	UpdateUser(newName string, id uuid.UUID) error
	UpdateRole(id uuid.UUID, role string) error

	GetUserProfileWithProducts(id uuid.UUID) (model.User, error)
}
