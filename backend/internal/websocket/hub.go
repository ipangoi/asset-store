package websocket

import "log"

type WSMessage struct {
	Type       string `json:"type"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id,omitempty"`
	Content    string `json:"content,omitempty"`
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
			onlineMsg := &WSMessage{
				Type:     "USER_ONLINE",
				SenderID: client.UserID,
			}
			for existingUserID, existingClient := range h.Clients {
				if existingUserID != client.UserID {
					// user baru online
					existingClient.Send <- onlineMsg

					client.Send <- &WSMessage{
						Type:     "USER_ONLINE",
						SenderID: existingUserID,
					}
				}
			}

		// client out
		case client := <-h.Unregister:
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send) // close channel
				log.Printf("User %s OFFLINE", client.UserID)

				offlineMsg := &WSMessage{
					Type:     "USER_OFFLINE",
					SenderID: client.UserID,
				}

				for _, remainingClient := range h.Clients {
					remainingClient.Send <- offlineMsg
				}
			}

		// message incoming
		case pesan := <-h.Broadcast:
			// check receiver online
			if targetClient, ok := h.Clients[pesan.ReceiverID]; ok {
				// non-blocking send: jika buffer penuh, disconnect client yang lambat
				// agar hub goroutine tidak deadlock
				select {
				case targetClient.Send <- pesan:
				default:
					log.Printf("Buffer penuh, disconnect User %s", targetClient.UserID)
					delete(h.Clients, targetClient.UserID)
					close(targetClient.Send)
				}
			} else {
				// doing nothing if offline
				log.Printf("Pesan tertunda: User %s sedang offline", pesan.ReceiverID)
			}
		}
	}
}
