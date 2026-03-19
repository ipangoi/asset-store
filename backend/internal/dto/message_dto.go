package dto

type MessageResponse struct {
	ID         string `json:"id"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
	IsRead     bool   `json:"is_read"`
	CreatedAt  string `json:"created_at"`
	From       string `json:"sender_name"`
	To         string `json:"receiver_name"`
}

type MessageRequest struct {
	Content string `json:"content"`
}
