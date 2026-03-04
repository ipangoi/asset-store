package service

import (
	"asset-store/internal/dto"

	"github.com/google/uuid"
)

type TransactionService interface {
	CreateTransaction(req dto.CreateTransactionRequest, userID uuid.UUID) (dto.TransactionResponse, error)
	GetTransactionByOrderID(orderID string) (dto.TransactionResponse, error)
	GetTransactionByUserID(userID uuid.UUID) ([]dto.TransactionResponse, error)
	GetTransactionByProductID(productID uuid.UUID) ([]dto.TransactionResponse, error)
	MidtransWebhook(notificationPayload map[string]interface{}) error
	VerifyPurchase(userID uuid.UUID, productID uuid.UUID) bool
}
