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
		if authHandler == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未持有token"})
			return
		}
		if !strings.HasPrefix(authHandler, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "携带token格式错误"})
			return
		}
		//strings.TrimPrefix去除字符串前面的字符
		token := strings.TrimPrefix(authHandler, "Bearer ")
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
