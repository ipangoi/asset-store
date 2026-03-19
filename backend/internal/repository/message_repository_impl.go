package repository

import (
	"asset-store/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageRepositoryImpl struct {
	db *gorm.DB
}

func NewMessageRepositoryImpl(db *gorm.DB) MessageRepository {
	return &MessageRepositoryImpl{db}
}

// CreateMessage implements [MessageRepository].
func (m *MessageRepositoryImpl) CreateMessage(message *model.Message) (model.Message, error) {
	err := m.db.Create(message).Error

	return *message, err
}

func (m *MessageRepositoryImpl) GetMessageByID(id uuid.UUID) (model.Message, error) {
	var message model.Message
	err := m.db.Where("id = ?", id).First(&message).Error
	return message, err
}

// GetChatHistory implements [MessageRepository].
func (m *MessageRepositoryImpl) GetChatHistory(senderID uuid.UUID, receiverID uuid.UUID) ([]model.Message, error) {
	var messages []model.Message

	err := m.db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", senderID, receiverID, receiverID, senderID).Order("created_at ASC").Find(&messages).Error

	return messages, err
}

// GetListChat implements [MessageRepository].
func (m *MessageRepositoryImpl) GetListChat(id uuid.UUID) ([]model.Message, error) {
	var messages []model.Message

	subQuery := m.db.Select("DISTINCT ON (CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END, CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END) *").Table("messages").Where("sender_id = ? OR receiver_id = ?", id, id).Order("CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END, CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END, created_at DESC")

	err := m.db.Preload("Sender").Preload("Receiver").Raw("SELECT * FROM (?) AS inbox ORDER BY created_at DESC", subQuery).Scan(&messages).Error
	return messages, err
}

// UpdateMessage implements [MessageRepository].
func (m *MessageRepositoryImpl) UpdateMessage(message *model.Message) (model.Message, error) {
	err := m.db.Model(&message).Updates(map[string]interface{}{
		"content": message.Content,
	}).Error

	return *message, err
}

// DeleteMessage implements [MessageRepository].
func (m *MessageRepositoryImpl) DeleteMessage(id uuid.UUID) error {
	return m.db.Where("id = ?", id).Delete(&model.Message{}).Error
}

// MarkAsRead implements [MessageRepository].
func (m *MessageRepositoryImpl) MarkAsRead(senderID uuid.UUID, receiverID uuid.UUID) error {
	return m.db.Model(&model.Message{}).Where("sender_id = ? AND receiver_id = ? AND is_read = ?", senderID, receiverID, false).Update("is_read", true).Error
}
