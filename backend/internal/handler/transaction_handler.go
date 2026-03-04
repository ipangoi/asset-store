package handler

import "github.com/gin-gonic/gin"

type TransactionHandler interface {
	CreateTransaction(c *gin.Context)
	GetUserTransactions(c *gin.Context)
	MidtransWebhook(c *gin.Context)
}
