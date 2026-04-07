//web服务注册

package handler

import (
	"log"
	"net/http"
	"second_hand_transaction/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type MessageHandler struct {
	Hub     *service.WsHub
	UserSvc *service.UserSvc
}

func NewMessageHandler(hub *service.WsHub, userSvc *service.UserSvc) *MessageHandler {
	return &MessageHandler{Hub: hub, UserSvc: userSvc}
}

func (h *MessageHandler) ConnectWS(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		// 通常 websocket 握手难以传递 auth header
		// 为简单起见，我们假设通过 query 形如 ?token=... 传递
		// 中间件如果在此之前拦截也没关系
		// 这里做双重校验
		c.JSON(401, gin.H{"error": "未登录"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("upgrade err:", err)
		return
	}

	h.Hub.AddClient(external, conn)
	defer func() {
		h.Hub.RemoveClient(external)
		conn.Close()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		h.Hub.HandleMessage(external, msg)
	}
}

func (h *MessageHandler) GetHistory(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录"})
		return
	}

	peerId := c.Query("peer_id")
	if peerId == "" {
		c.JSON(400, gin.H{"error": "missing peer_id"})
		return
	}

	messages, err := h.Hub.GetHistory(external, peerId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": messages})
}
