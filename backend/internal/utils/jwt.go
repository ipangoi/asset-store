package utils

import (
	"asset-store/internal/config"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type MyClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(id uuid.UUID, role string) (string, error) {
	secretKey := os.Getenv("JWT_SECRET")

	claims := MyClaims{
		UserID: id,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

func ValidateToken(tokenString string) (*MyClaims, error) {
	secretKey := os.Getenv("JWT_SECRET")

	token, err := jwt.ParseWithClaims(tokenString, &MyClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*MyClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// GenerateRefreshToken stores a UUID-based refresh token in Redis (7-day TTL) keyed to the userID.
func GenerateRefreshToken(userID uuid.UUID) (string, error) {
	token := uuid.New().String()
	key := "refresh_token:" + token
	err := config.RedisClient.Set(config.Ctx, key, userID.String(), 7*24*time.Hour).Err()
	if err != nil {
		return "", err
	}
	return token, nil
}

// ValidateRefreshToken looks up the token in Redis, returns the associated userID, and rotates (deletes) the token.
func ValidateRefreshToken(token string) (uuid.UUID, error) {
	key := "refresh_token:" + token
	userIDStr, err := config.RedisClient.Get(config.Ctx, key).Result()
	if err != nil {
		return uuid.Nil, errors.New("invalid or expired refresh token")
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, errors.New("malformed refresh token data")
	}
	config.RedisClient.Del(config.Ctx, key)
	return userID, nil
}
