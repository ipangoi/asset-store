package websocket

import "log"

type WSMessage struct {
	Type       string `json:"type"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

type Hub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *WSMessage
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *WSMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		// client incoming
		case client := <-h.Register:
			h.Clients[client.UserID] = client
			log.Printf("User %s ONLINE", client.UserID)

		// client out
		case client := <-h.Unregister:
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send) // close channel
				log.Printf("User %s OFFLINE", client.UserID)
			}

		// message incoming
		case pesan := <-h.Broadcast:
			// check receiver online
			if targetClient, ok := h.Clients[pesan.ReceiverID]; ok {
				// send to target if online
				targetClient.Send <- pesan
			} else {
				// doing nothing if offline
				log.Printf("Pesan tertunda: User %s sedang offline", pesan.ReceiverID)
			}
		}
	}
}
