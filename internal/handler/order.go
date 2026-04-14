//web服务注册

package handler

import (
	"second_hand_transaction/internal/service"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	OrderSvc *service.OrderSvc
	UserSvc  *service.UserSvc
}

func NewOrderHandler(orderSvc *service.OrderSvc, userSvc *service.UserSvc) *OrderHandler {
	return &OrderHandler{OrderSvc: orderSvc, UserSvc: userSvc}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}
	username := c.GetString("Username")
	_ = h.UserSvc.SyncUserInf(external, username)

	var req struct {
		ProductId uint `json:"product_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	order, err := h.OrderSvc.CreateOrder(external, req.ProductId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": order})
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}

	var req struct {
		OrderId uint   `json:"order_id" binding:"required"`
		Action  string `json:"action" binding:"required"` // pay, ship, complete, cancel
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.OrderSvc.UpdateOrderStatus(external, req.OrderId, req.Action)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": "success"})
}

func (h *OrderHandler) ListOrders(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}

	role := c.DefaultQuery("role", "buyer") // seller 或 buyer
	orders, err := h.OrderSvc.ListOrders(external, role)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": orders})
}
