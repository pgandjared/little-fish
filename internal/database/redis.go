package database

import (
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var redisDB *redis.Client

func InitRedis() *redis.Client {
	addr := viper.GetString("redis.addr")
	password := viper.GetString("redis.password")
	db := viper.GetInt("redis.db")
	//连接到redis
	redisDB = redis.NewClient(&redis.Options{Addr: addr, Password: password, DB: db})
	//测试连接
	_, err := redisDB.Ping(context.Background()).Result()
	if err != nil {
		zap.L().Fatal("redis连接失败", zap.Error(err))
	}
	return redisDB
}
