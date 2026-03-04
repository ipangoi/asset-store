package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
)

type TransactionRepository interface {
	Create(transaction model.Transaction) (model.Transaction, error)
	FindByOrderID(orderID string) (model.Transaction, error)
	FindByUserID(userID uuid.UUID) ([]model.Transaction, error)
	FindByProductID(productID uuid.UUID) ([]model.Transaction, error)
	UpdateStatus(orderID string, status string) error
	CheckExistingTransaction(userID uuid.UUID, productID uuid.UUID) (model.Transaction, error)
	VerifyPurchase(userID uuid.UUID, productID uuid.UUID) (bool, error)
}
