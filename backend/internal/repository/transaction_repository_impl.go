package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type transactionRepositoryImpl struct {
	db *gorm.DB
}

func NewTransactionRepositoryImpl(db *gorm.DB) TransactionRepository {
	return &transactionRepositoryImpl{db}
}

func (t *transactionRepositoryImpl) Create(transaction model.Transaction) (model.Transaction, error) {

	return transaction, t.db.Create(&transaction).Error
}

func (t *transactionRepositoryImpl) FindByOrderID(orderID string) (model.Transaction, error) {
	var transaction model.Transaction
	return transaction, t.db.Preload("Product").Where("order_id = ?", orderID).First(&transaction).Error
}

func (t *transactionRepositoryImpl) FindByUserID(userID uuid.UUID) ([]model.Transaction, error) {
	var transactions []model.Transaction
	return transactions, t.db.Preload("Product").Where("user_id = ?", userID).Find(&transactions).Error
}

func (t *transactionRepositoryImpl) FindByProductID(productID uuid.UUID) ([]model.Transaction, error) {
	var transactions []model.Transaction
	return transactions, t.db.Preload("User").Where("product_id = ?", productID).Find(&transactions).Error
}

func (t *transactionRepositoryImpl) UpdateStatus(orderID string, status string) error {
	return t.db.Model(&model.Transaction{}).Where("order_id = ?", orderID).Update("status", status).Error
}

func (t *transactionRepositoryImpl) CheckExistingTransaction(userID uuid.UUID, productID uuid.UUID) (model.Transaction, error) {
	var transaction model.Transaction
	err := t.db.Where("user_id = ? AND product_id = ?", userID, productID).
		Order("created_at desc").
		First(&transaction).Error
	return transaction, err
}

func (t *transactionRepositoryImpl) VerifyPurchase(userID uuid.UUID, productID uuid.UUID) (bool, error) {
	var count int64
	err := t.db.Model(&model.Transaction{}).
		Where("user_id = ? AND product_id = ? AND status = ?", userID, productID, "settlement").
		Count(&count).Error

	return count > 0, err
}

func (t *transactionRepositoryImpl) GetSellerAnalytics(sellerID uuid.UUID) (int64, int64, error) {
	type result struct {
		TotalSales   int64
		TotalRevenue int64
	}
	var r result
	err := t.db.Raw(`
		SELECT COUNT(t.id) AS total_sales, COALESCE(SUM(t.amount), 0) AS total_revenue
		FROM transactions t
		JOIN products p ON t.product_id = p.id
		WHERE p.user_id = ? AND t.status = 'settlement'
	`, sellerID).Scan(&r).Error
	return r.TotalSales, r.TotalRevenue, err
}
