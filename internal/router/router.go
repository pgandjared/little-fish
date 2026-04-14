//web路由注册

package router

import (
	"second_hand_transaction/internal/handler"
	"second_hand_transaction/internal/middleware"

	"github.com/gin-gonic/gin"
	ginprometheus "github.com/zsais/go-gin-prometheus"
)

func InitRouter(productHandler *handler.ProductHandler, orderHandler *handler.OrderHandler, messageHandler *handler.MessageHandler) *gin.Engine {
	r := gin.Default()
	//prometheus监控中间件
	p := ginprometheus.NewPrometheus("gin")
	p.Use(r)
	//不需要登录的服务
	r.GET("/ping", func(context *gin.Context) { context.JSON(200, gin.H{"status": "success", "msg": "网络已经连通"}) })
	r.GET("/products", productHandler.GetProducts)

	// 静态文件服务，让上传的图片可以通过 URL 访问
	r.Static("/uploads", "./uploads")

	authGroup := r.Group("/api")
	authGroup.Use(middleware.CasdoorAuth())
	{
		// 图片上传
		authGroup.POST("upload", handler.UploadImage)
		authGroup.POST("product", productHandler.CreateProduct)
		authGroup.PUT("product", productHandler.UpdateProduct)
		authGroup.DELETE("product", productHandler.DeleteProduct)

		// Order routes
		authGroup.POST("order", orderHandler.CreateOrder)
		authGroup.GET("order", orderHandler.ListOrders)
		authGroup.PUT("order/status", orderHandler.UpdateOrderStatus)

		// Message route
		authGroup.GET("message/history", messageHandler.GetHistory)
		// WebSocket endpoint
		authGroup.GET("message/ws", messageHandler.ConnectWS)
	}
	return r
}
