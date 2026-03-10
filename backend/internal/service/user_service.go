package service

import (
	"asset-store/internal/dto"

	"github.com/google/uuid"
)

type UserService interface {
	Register(user dto.UserRegisterRequest) (dto.UserResponse, error)
	Login(user dto.UserLoginRequest) (dto.UserResponse, error)
	FindByEmail(email string) (dto.UserResponse, error)
	FindByID(id uuid.UUID) (dto.UserResponse, error)
	UpdateUser(req dto.UserUpdateProfileRequest, id uuid.UUID) error
	UpdateRole(id uuid.UUID, req dto.UserUpdateRoleRequest) error

	GetPublicProfile(id uuid.UUID) (dto.UserPublicProfileResponse, error)
}
