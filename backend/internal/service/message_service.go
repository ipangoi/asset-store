package service

import (
	"asset-store/internal/dto"

	"github.com/google/uuid"
)

type MessageService interface {
	SendMessage(req dto.MessageRequest, senderID uuid.UUID, receiverID uuid.UUID) (dto.MessageResponse, error)
	GetChatHistory(senderID uuid.UUID, receiverID uuid.UUID) ([]dto.MessageResponse, error)
	GetListChat(id uuid.UUID) ([]dto.MessageResponse, error)
	UpdateMessage(req dto.MessageRequest, messageID uuid.UUID, userID uuid.UUID) (dto.MessageResponse, error)
	DeleteMessage(messageID uuid.UUID, userID uuid.UUID) error
	MarkAsRead(senderID uuid.UUID, receiverID uuid.UUID) error
}
