package service

import (
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type TransactionServiceImpl struct {
	transactionRepo repository.TransactionRepository
	userRepo        repository.UserRepository
	productRepo     repository.ProductRepository
}

func NewTransactionServiceImpl(transactionRepository repository.TransactionRepository, userRepo repository.UserRepository, productRepo repository.ProductRepository) TransactionService {
	return &TransactionServiceImpl{transactionRepository, userRepo, productRepo}
}

func (s *TransactionServiceImpl) CreateTransaction(req dto.CreateTransactionRequest, userID uuid.UUID) (dto.TransactionResponse, error) {
	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		return dto.TransactionResponse{}, errors.New("Invalid Product ID format")
	}

	existingTransaction, err := s.transactionRepo.CheckExistingTransaction(userID, productID)
	if err == nil {
		if existingTransaction.Status == "settlement" {
			return dto.TransactionResponse{}, errors.New("Already buyed this product")
		}

		if existingTransaction.Status == "pending" {
			return dto.TransactionResponse{
				ID:              existingTransaction.ID.String(),
				ProductID:       existingTransaction.ProductID.String(),
				Amount:          existingTransaction.Amount,
				Status:          existingTransaction.Status,
				SnapToken:       existingTransaction.SnapToken,
				SnapRedirectURL: existingTransaction.SnapRedirectURL,
			}, nil
		}
	}

	product, err := s.productRepo.GetProductByID(productID)
	if err != nil {
		return dto.TransactionResponse{}, errors.New("Product not found")
	}

	orderID := fmt.Sprintf("TRX-%d", time.Now().Unix())

	// buy free
	if product.Price == 0 {
		newTransaction := model.Transaction{
			OrderID:         orderID,
			UserID:          userID,
			ProductID:       product.ID,
			Amount:          0,
			Status:          "settlement",
			SnapToken:       "",
			SnapRedirectURL: "",
		}

		createdTransaction, err := s.transactionRepo.Create(newTransaction)
		if err != nil {
			return dto.TransactionResponse{}, err
		}

		return dto.TransactionResponse{
			ID:              createdTransaction.ID.String(),
			ProductID:       createdTransaction.ProductID.String(),
			Amount:          createdTransaction.Amount,
			Status:          createdTransaction.Status,
			SnapToken:       createdTransaction.SnapToken,
			SnapRedirectURL: createdTransaction.SnapRedirectURL,
			IsFree:          true,
			Product: dto.ProductResponse{
				ID:           product.ID.String(),
				Title:        product.Title,
				Description:  product.Description,
				Price:        product.Price,
				ThumbnailURL: product.ThumbnailURL,
			},
		}, nil
	}

	// Request ke Midtrans
	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(product.Price),
		},
		Items: &[]midtrans.ItemDetails{
			{
				ID:    product.ID.String(),
				Name:  product.Title,
				Price: int64(product.Price),
				Qty:   1,
			},
		},
	}

	snapResp, errMidtrans := snap.CreateTransaction(snapReq)
	if errMidtrans != nil {
		return dto.TransactionResponse{}, errors.New("Midtrans provider error: " + errMidtrans.Message)
	}

	newTransaction := model.Transaction{
		OrderID:         orderID,
		UserID:          userID,
		ProductID:       product.ID,
		Amount:          product.Price,
		Status:          "pending",
		SnapToken:       snapResp.Token,
		SnapRedirectURL: snapResp.RedirectURL,
	}

	createdTransaction, err := s.transactionRepo.Create(newTransaction)
	if err != nil {
		return dto.TransactionResponse{}, err
	}

	return dto.TransactionResponse{
		ID:              createdTransaction.ID.String(),
		ProductID:       createdTransaction.ProductID.String(),
		Amount:          createdTransaction.Amount,
		Status:          createdTransaction.Status,
		SnapToken:       createdTransaction.SnapToken,
		SnapRedirectURL: createdTransaction.SnapRedirectURL,
		Product: dto.ProductResponse{
			ID:           createdTransaction.Product.ID.String(),
			Title:        createdTransaction.Product.Title,
			Description:  createdTransaction.Product.Description,
			Price:        createdTransaction.Product.Price,
			ThumbnailURL: createdTransaction.Product.ThumbnailURL,
		},
	}, nil
}

func (s *TransactionServiceImpl) GetTransactionByOrderID(orderID string) (dto.TransactionResponse, error) {
	transaction, err := s.transactionRepo.FindByOrderID(orderID)
	if err != nil {
		return dto.TransactionResponse{}, err
	}

	return dto.TransactionResponse{
		ID:              transaction.ID.String(),
		ProductID:       transaction.ProductID.String(),
		Amount:          transaction.Amount,
		Status:          transaction.Status,
		SnapRedirectURL: transaction.SnapRedirectURL,
		Product: dto.ProductResponse{
			ID:           transaction.Product.ID.String(),
			Title:        transaction.Product.Title,
			Description:  transaction.Product.Description,
			Price:        transaction.Product.Price,
			ThumbnailURL: transaction.Product.ThumbnailURL,
		},
	}, nil
}

func (s *TransactionServiceImpl) GetTransactionByUserID(userID uuid.UUID) ([]dto.TransactionResponse, error) {
	transaction, err := s.transactionRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	var responses []dto.TransactionResponse

	for _, t := range transaction {
		responses = append(responses, dto.TransactionResponse{
			ID:              t.ID.String(),
			ProductID:       t.ProductID.String(),
			Amount:          t.Amount,
			Status:          t.Status,
			SnapRedirectURL: t.SnapRedirectURL,
			Product: dto.ProductResponse{
				ID:           t.Product.ID.String(),
				Title:        t.Product.Title,
				Description:  t.Product.Description,
				Price:        t.Product.Price,
				ThumbnailURL: t.Product.ThumbnailURL,
			},
		})
	}

	return responses, nil
}

func (s *TransactionServiceImpl) GetTransactionByProductID(productID uuid.UUID) ([]dto.TransactionResponse, error) {
	transaction, err := s.transactionRepo.FindByProductID(productID)
	if err != nil {
		return nil, err
	}

	var responses []dto.TransactionResponse
	for _, t := range transaction {
		responses = append(responses, dto.TransactionResponse{
			ID:              t.ID.String(),
			ProductID:       t.ProductID.String(),
			Amount:          t.Amount,
			Status:          t.Status,
			SnapRedirectURL: t.SnapRedirectURL,
			Product: dto.ProductResponse{
				ID:           t.Product.ID.String(),
				Title:        t.Product.Title,
				Description:  t.Product.Description,
				Price:        t.Product.Price,
				ThumbnailURL: t.Product.ThumbnailURL,
			},
		})
	}

	return responses, nil
}

func (s *TransactionServiceImpl) MidtransWebhook(notificationPayload map[string]interface{}) error {
	orderID, _ := notificationPayload["order_id"].(string)
	status, _ := notificationPayload["transaction_status"].(string)

	finalStatus := "pending"
	switch status {
	case "settlement", "capture":
		finalStatus = "settlement"
	case "expire", "cancel", "deny":
		finalStatus = "failed"
	}

	return s.transactionRepo.UpdateStatus(orderID, finalStatus)
}

func (s *TransactionServiceImpl) VerifyPurchase(userID uuid.UUID, productID uuid.UUID) bool {
	product, err := s.productRepo.GetProductByID(productID)
	if err == nil && product.UserID == userID {
		return true
	}

	isPurchased, err := s.transactionRepo.VerifyPurchase(userID, productID)
	if err != nil {
		return false
	}

	return isPurchased
}
