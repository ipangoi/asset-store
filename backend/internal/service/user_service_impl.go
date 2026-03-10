package service

import (
	"asset-store/internal/config"
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"encoding/json"
	"errors"
	"time"

	"asset-store/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserServiceImpl struct {
	userRepo   repository.UserRepository
	reviewRepo repository.ReviewRepository
}

func NewUserServiceImpl(userRepo repository.UserRepository, reviewRepo repository.ReviewRepository) UserService {
	return &UserServiceImpl{userRepo, reviewRepo}
}

func (s *UserServiceImpl) Register(user dto.UserRegisterRequest) (dto.UserResponse, error) {
	_, err := s.userRepo.GetUserByEmail(user.Email)
	if err == nil {
		return dto.UserResponse{}, errors.New("Email Already Registered")
	}
	if err != gorm.ErrRecordNotFound {
		return dto.UserResponse{}, err
	}

	hash, err := utils.HashPassword(user.Password)
	if err != nil {
		return dto.UserResponse{}, err
	}

	newUser := model.User{
		Name:         user.Name,
		Email:        user.Email,
		PasswordHash: hash,
		Role:         "buyer",
	}

	createdUser, err := s.userRepo.CreateUser(newUser)
	if err != nil {
		return dto.UserResponse{}, err
	}

	return dto.UserResponse{
		ID:    createdUser.ID.String(),
		Email: createdUser.Email,
		Role:  createdUser.Role,
	}, nil
}

func (s *UserServiceImpl) Login(req dto.UserLoginRequest) (dto.UserResponse, error) {
	user, err := s.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		return dto.UserResponse{}, errors.New("invalid email or password")
	}

	userTrue := utils.ComparePass(user.PasswordHash, req.Password)
	if !userTrue {
		return dto.UserResponse{}, errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return dto.UserResponse{}, err
	}

	return dto.UserResponse{
		ID:    user.ID.String(),
		Email: user.Email,
		Role:  user.Role,
		Token: token,
	}, nil
}

func (s *UserServiceImpl) FindByEmail(email string) (dto.UserResponse, error) {
	findUser, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return dto.UserResponse{}, err
	}

	return dto.UserResponse{
		ID:    findUser.ID.String(),
		Email: findUser.Email,
		Role:  findUser.Role,
	}, nil
}

func (s *UserServiceImpl) FindByID(id uuid.UUID) (dto.UserResponse, error) {
	findUser, err := s.userRepo.GetUserByID(id)
	if err != nil {
		return dto.UserResponse{}, err
	}

	return dto.UserResponse{
		ID:    findUser.ID.String(),
		Name:  findUser.Name,
		Email: findUser.Email,
		Role:  findUser.Role,
	}, nil
}

func (s *UserServiceImpl) UpdateUser(req dto.UserUpdateProfileRequest, id uuid.UUID) error {
	return s.userRepo.UpdateUser(req.Name, id)
}

func (s *UserServiceImpl) UpdateRole(id uuid.UUID, req dto.UserUpdateRoleRequest) error {
	return s.userRepo.UpdateRole(id, req.Role)
}

func (s *UserServiceImpl) GetPublicProfile(id uuid.UUID) (dto.UserPublicProfileResponse, error) {
	cacheKey := "profile:" + id.String()
	cachedData, err := config.RedisClient.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		var response dto.UserPublicProfileResponse
		json.Unmarshal([]byte(cachedData), &response)
		return response, nil
	}

	findUser, err := s.userRepo.GetUserProfileWithProducts(id)
	if err != nil {
		return dto.UserPublicProfileResponse{}, err
	}

	var responses []dto.ProductResponse

	for _, product := range findUser.Products {
		rating, _ := s.reviewRepo.GetAverageRating(product.ID)
		totalReviews, _ := s.reviewRepo.CountTotalReviewsByProductID(product.ID)
		responses = append(responses, dto.ProductResponse{
			ID:            product.ID.String(),
			Title:         product.Title,
			Description:   product.Description,
			Price:         product.Price,
			ThumbnailURL:  product.ThumbnailURL,
			AssetFileKey:  product.AssetFileKey,
			SellerID:      findUser.ID.String(),
			SellerName:    findUser.Name,
			CategoryName:  product.Category.Name,
			AverageRating: rating,
			TotalReviews:  int(totalReviews),
		})
	}

	profileResponse := dto.UserPublicProfileResponse{
		ID:       findUser.ID.String(),
		Name:     findUser.Name,
		Products: responses,
	}

	profileJSON, _ := json.Marshal(profileResponse)
	config.RedisClient.Set(config.Ctx, cacheKey, string(profileJSON), 1*time.Hour)

	return profileResponse, nil
}
