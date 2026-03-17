package websocket

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// standart timeout for websockets (gorilla)
const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

// Client is a middleman between the websocket connection and the hub
type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	UserID string
	Send   chan *WSMessage
}

func (c *Client) ReadPump() {
	// Close the connection if the client disconnects and delete client
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	// Set read deadline to PongWait
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		// catch from fe via ws.send
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error ReadPump: %v", err)
			}
			break
		}
	}
}

// give json to fe from hub
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		// message from hub
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// write json and send to fe
			err := c.Conn.WriteJSON(message)
			if err != nil {
				log.Printf("Gagal kirim pesan ke %s: %v", c.UserID, err)
				return
			}

		// ping
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
