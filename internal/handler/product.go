//web服务注册

package handler

import (
	"second_hand_transaction/internal/service"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	ProductSvc *service.ProductSvc
	UserSvc    *service.UserSvc
}

func NewProductHandler(productsvc *service.ProductSvc, usersvc *service.UserSvc) *ProductHandler {
	return &ProductHandler{ProductSvc: productsvc, UserSvc: usersvc}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	Products, err := h.ProductSvc.List()
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": Products})
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}
	username := c.GetString("Username")
	err := h.UserSvc.SyncUserInf(external, username)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	var Product struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description" `
		Cost        uint   `json:"cost" binding:"required"`
	}
	err = c.ShouldBindJSON(&Product)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	err = h.ProductSvc.Create(Product.Name, Product.Description, external, Product.Cost)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": Product})
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}
	username := c.GetString("Username")
	err := h.UserSvc.SyncUserInf(external, username)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	var Product struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description" `
		Id          uint   `json:"id" binding:"required"`
		Cost        uint   `json:"cost" binding:"required" `
	}
	err = c.ShouldBindJSON(&Product)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	err = h.ProductSvc.Update(Product.Name, Product.Description, external, Product.Id, Product.Cost)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
	}
	c.JSON(200, gin.H{"data": Product})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	external := c.GetString("ExternalID")
	if external == "" {
		c.JSON(401, gin.H{"error": "未登录,请先登录"})
		return
	}
	username := c.GetString("Username")
	err := h.UserSvc.SyncUserInf(external, username)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	var id uint
	err = c.ShouldBindQuery(&id)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
	}
	err = h.ProductSvc.Del(external, id)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
	}
	c.JSON(200, gin.H{"data": "删除成功"})
}
