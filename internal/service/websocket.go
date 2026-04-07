//服务创建

package service

import (
	"encoding/json"
	"log"
	"second_hand_transaction/internal/model"
	"second_hand_transaction/internal/repository"
	"sync"

	"github.com/gorilla/websocket"
)

type WsHub struct {
	// 在线客户端表 map[userId]*websocket.Conn
	clients map[string]*websocket.Conn
	mu      sync.RWMutex
	Repo    *repository.MessageRepo
}

func NewWsHub(repo *repository.MessageRepo) *WsHub {
	return &WsHub{
		clients: make(map[string]*websocket.Conn),
		Repo:    repo,
	}
}

func (h *WsHub) AddClient(userId string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userId] = conn
}

func (h *WsHub) RemoveClient(userId string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, userId)
}

// websocket输入参数
type WsMessagePayload struct {
	ReceiverId string `json:"receiver_id"`
	Content    string `json:"content"`
}

func (h *WsHub) HandleMessage(senderId string, rawMessage []byte) {
	var payload WsMessagePayload
	if err := json.Unmarshal(rawMessage, &payload); err != nil {
		log.Println("Invalid websocket message:", err)
		return
	}

	if payload.ReceiverId == "" || payload.Content == "" {
		return
	}

	// 消息落盘持久化
	msg := &model.Message{
		SenderId:   senderId,
		ReceiverId: payload.ReceiverId,
		Content:    payload.Content,
	}
	_ = h.Repo.CreateMessage(msg)

	h.mu.RLock()
	receiverConn, ok := h.clients[payload.ReceiverId]
	h.mu.RUnlock()

	if ok {
		// 发送消息给接收者
		b, _ := json.Marshal(msg)
		_ = receiverConn.WriteMessage(websocket.TextMessage, b)
	}
}

func (h *WsHub) GetHistory(user1, user2 string) ([]model.Message, error) {
	return h.Repo.GetChatHistory(user1, user2)
}
