package service

import (
	"asset-store/internal/dto"
	"asset-store/internal/model"
	"asset-store/internal/repository"
	"errors"

	"github.com/google/uuid"
)

type MessageServiceImpl struct {
	messageRepository repository.MessageRepository
	userRepository    repository.UserRepository
}

func NewMessageServiceImpl(messageRepository repository.MessageRepository, userRepository repository.UserRepository) MessageService {
	return &MessageServiceImpl{messageRepository, userRepository}
}

// SendMessage implements [MessageService].
func (m *MessageServiceImpl) SendMessage(req dto.MessageRequest, senderID uuid.UUID, receiverID uuid.UUID) (dto.MessageResponse, error) {
	_, err := m.userRepository.GetUserByID(senderID)
	if err != nil {
		return dto.MessageResponse{}, errors.New("Sender Not Found")
	}

	_, err = m.userRepository.GetUserByID(receiverID)
	if err != nil {
		return dto.MessageResponse{}, errors.New("Receiver Not Found")
	}

	message := model.Message{
		SenderID:   senderID,
		ReceiverID: receiverID,
		Content:    req.Content,
		IsRead:     false,
	}

	newMessage, err := m.messageRepository.CreateMessage(&message)
	if err != nil {
		return dto.MessageResponse{}, err
	}

	response := dto.MessageResponse{
		ID:         newMessage.ID.String(),
		SenderID:   newMessage.SenderID.String(),
		ReceiverID: newMessage.ReceiverID.String(),
		IsRead:     newMessage.IsRead,
		Content:    newMessage.Content,
		From:       newMessage.Sender.Name,
		To:         newMessage.Receiver.Name,
		CreatedAt:  newMessage.CreatedAt.String(),
	}

	return response, nil
}

// GetChatHistory implements [MessageService].
func (m *MessageServiceImpl) GetChatHistory(senderID uuid.UUID, receiverID uuid.UUID) ([]dto.MessageResponse, error) {
	response := []dto.MessageResponse{}

	messages, err := m.messageRepository.GetChatHistory(senderID, receiverID)
	if err != nil {
		return response, err
	}

	for _, message := range messages {
		response = append(response, dto.MessageResponse{
			ID:         message.ID.String(),
			SenderID:   message.SenderID.String(),
			ReceiverID: message.ReceiverID.String(),
			Content:    message.Content,
			IsRead:     message.IsRead,
			From:       message.Sender.Name,
			To:         message.Receiver.Name,
			CreatedAt:  message.CreatedAt.String(),
		})
	}

	return response, nil
}

// GetListChat implements [MessageService].
func (m *MessageServiceImpl) GetListChat(id uuid.UUID) ([]dto.MessageResponse, error) {
	response := []dto.MessageResponse{}

	messages, err := m.messageRepository.GetListChat(id)
	if err != nil {
		return response, err
	}

	for _, message := range messages {
		response = append(response, dto.MessageResponse{
			ID:         message.ID.String(),
			SenderID:   message.SenderID.String(),
			ReceiverID: message.ReceiverID.String(),
			Content:    message.Content,
			IsRead:     message.IsRead,
			From:       message.Sender.Name,
			To:         message.Receiver.Name,
			CreatedAt:  message.CreatedAt.String(),
		})
	}

	return response, nil
}

// UpdateMessage implements [MessageService].
func (m *MessageServiceImpl) UpdateMessage(req dto.MessageRequest, messageID uuid.UUID, userID uuid.UUID) (dto.MessageResponse, error) {
	message, err := m.messageRepository.GetMessageByID(messageID)
	if err != nil {
		return dto.MessageResponse{}, errors.New("Message Not Found")
	}

	if message.SenderID != userID {
		return dto.MessageResponse{}, errors.New("Unauthorized")
	}

	message.Content = req.Content

	updatedMessage, err := m.messageRepository.UpdateMessage(&message)
	if err != nil {
		return dto.MessageResponse{}, err
	}

	response := dto.MessageResponse{
		ID:         updatedMessage.ID.String(),
		SenderID:   updatedMessage.SenderID.String(),
		ReceiverID: updatedMessage.ReceiverID.String(),
		Content:    updatedMessage.Content,
		IsRead:     updatedMessage.IsRead,
		From:       updatedMessage.Sender.Name,
		To:         updatedMessage.Receiver.Name,
		CreatedAt:  updatedMessage.CreatedAt.String(),
	}

	return response, nil
}

// DeleteMessage implements [MessageService].
func (m *MessageServiceImpl) DeleteMessage(messageID uuid.UUID, userID uuid.UUID) error {
	message, err := m.messageRepository.GetMessageByID(messageID)
	if err != nil {
		return errors.New("Message Not Found")
	}

	if message.SenderID != userID {
		return errors.New("Unauthorized")
	}

	return m.messageRepository.DeleteMessage(messageID)
}

// MarkAsRead implements [MessageService].
func (m *MessageServiceImpl) MarkAsRead(senderID uuid.UUID, receiverID uuid.UUID) error {
	return m.messageRepository.MarkAsRead(senderID, receiverID)
}
