package handler

import (
	"asset-store/internal/dto"
	"asset-store/internal/service"
	ws "asset-store/internal/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type MessageHandlerImpl struct {
	messageService service.MessageService
	hub            *ws.Hub
}

func NewMessageHandlerImpl(messageService service.MessageService, hub *ws.Hub) MessageHandler {
	return &MessageHandlerImpl{messageService, hub}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// ServeWebSocket implements [MessageHandler].
func (m *MessageHandlerImpl) ServeWebSocket(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &ws.Client{
		Hub:    m.hub,
		Conn:   conn,
		UserID: userID.String(),
		Send:   make(chan *ws.WSMessage, 256),
	}

	client.Hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}

// SendMessage implements [MessageHandler].
func (m *MessageHandlerImpl) SendMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	receiverID, err := uuid.Parse(c.Param("receiver_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Receiver ID"})
		return
	}

	var req dto.MessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := m.messageService.SendMessage(req, userID, receiverID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	wsMsg := &ws.WSMessage{
		Type:       "CHAT",
		SenderID:   userID.String(),
		ReceiverID: receiverID.String(),
		Content:    res.Content,
	}
	m.hub.Broadcast <- wsMsg

	c.JSON(http.StatusCreated, res)

}

// GetChatHistory implements [MessageHandler].
func (m *MessageHandlerImpl) GetChatHistory(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	receiverID, err := uuid.Parse(c.Param("receiver_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Receiver ID"})
		return
	}

	res, err := m.messageService.GetChatHistory(userID, receiverID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// GetListChat implements [MessageHandler].
func (m *MessageHandlerImpl) GetListChat(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	res, err := m.messageService.GetListChat(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// UpdateMessage implements [MessageHandler].
func (m *MessageHandlerImpl) UpdateMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	messageID, err := uuid.Parse(c.Param("message_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Message ID"})
		return
	}

	var req dto.MessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := m.messageService.UpdateMessage(req, messageID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// DeleteMessage implements [MessageHandler].
func (m *MessageHandlerImpl) DeleteMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	messageID, err := uuid.Parse(c.Param("message_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Message ID"})
		return
	}

	err = m.messageService.DeleteMessage(messageID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
}

// MarkAsRead implements [MessageHandler].
func (m *MessageHandlerImpl) MarkAsRead(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	senderID, err := uuid.Parse(c.Param("sender_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Sender ID"})
		return
	}

	err = m.messageService.MarkAsRead(userID, senderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	wsMsg := &ws.WSMessage{
		Type:       "READ_RECEIPT",
		SenderID:   userID.String(),
		ReceiverID: senderID.String(),
		Content:    "Message marked as read",
	}
	m.hub.Broadcast <- wsMsg

	c.JSON(http.StatusOK, gin.H{"message": "Messages marked as read"})
}
