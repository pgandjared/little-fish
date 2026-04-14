package middleware

import (
	"net/http"
	"strings"

	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func InitCasdoor() {
	casdoorsdk.InitConfig(
		viper.GetString("casdoor.url"),
		viper.GetString("casdoor.clientId"),
		viper.GetString("casdoor.clientSecret"),
		viper.GetString("casdoor.publicKey"),
		viper.GetString("casdoor.organName"),
		viper.GetString("casdoor.appName"),
	)
}
func CasdoorAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		//验证http返回的url格式并获取token
		authHandler := c.GetHeader("Authorization")
		var token string

		if authHandler != "" && strings.HasPrefix(authHandler, "Bearer ") {
			token = strings.TrimPrefix(authHandler, "Bearer ")
		} else {
			// 如果 Header 没有，尝试从 URL Query 提取，用于支持 WebSocket连接
			token = c.Query("token")
		}

		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未持有token或格式错误"})
			return
		}
		//使用casdoor的sdk解析
		claims, err := casdoorsdk.ParseJwtToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.Set("ExternalID", claims.User.Id)
		c.Set("Username", claims.User.DisplayName)
		c.Next()
	}
}
