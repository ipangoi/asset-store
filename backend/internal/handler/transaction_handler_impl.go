package handler

import (
	"asset-store/internal/dto"
	"asset-store/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TransactionHandlerImpl struct {
	transactionService service.TransactionService
}

func NewTransactionHandlerImpl(transactionService service.TransactionService) TransactionHandler {
	return &TransactionHandlerImpl{transactionService}
}

func (h *TransactionHandlerImpl) CreateTransaction(c *gin.Context) {
	var req dto.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil ID User dari Middleware JWT
	userID := c.MustGet("user_id").(uuid.UUID)

	res, err := h.transactionService.CreateTransaction(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (h *TransactionHandlerImpl) MidtransWebhook(c *gin.Context) {
	var notificationPayload map[string]any

	// Midtrans mengirim data dalam bentuk JSON
	if err := c.ShouldBindJSON(&notificationPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	err := h.transactionService.MidtransWebhook(notificationPayload)
	if err != nil {
		if err.Error() == "invalid webhook signature" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Midtrans butuh respon 200 OK supaya tidak kirim ulang notifikasi
	c.JSON(http.StatusOK, gin.H{"message": "webhook processed"})
}

func (h *TransactionHandlerImpl) GetUserTransactions(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	res, err := h.transactionService.GetTransactionByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *TransactionHandlerImpl) VerifyTransaction(c *gin.Context) {
	var body struct {
		OrderID string `json:"order_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := h.transactionService.VerifyAndUpdateTransaction(body.OrderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *TransactionHandlerImpl) GetSellerAnalytics(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	res, err := h.transactionService.GetSellerAnalytics(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
