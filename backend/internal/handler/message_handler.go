package handler

import "github.com/gin-gonic/gin"

type MessageHandler interface {
	SendMessage(c *gin.Context)
	GetChatHistory(c *gin.Context)
	GetListChat(c *gin.Context)
	UpdateMessage(c *gin.Context)
	DeleteMessage(c *gin.Context)
	MarkAsRead(c *gin.Context)

	ServeWebSocket(c *gin.Context)
}
