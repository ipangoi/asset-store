package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
)

type MessageRepository interface {
	CreateMessage(message *model.Message) (model.Message, error)
	GetMessageByID(id uuid.UUID) (model.Message, error)
	GetListChat(id uuid.UUID) ([]model.Message, error)
	GetChatHistory(senderID, receiverID uuid.UUID, limit, offset int) ([]model.Message, error)
	UpdateMessage(message *model.Message) (model.Message, error)
	DeleteMessage(id uuid.UUID) error
	MarkAsRead(senderID uuid.UUID, receiverID uuid.UUID) error
	CountUnread(userID uuid.UUID) (int64, error)
}
