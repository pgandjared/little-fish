package main

import (
	"second_hand_transaction/internal/database"
	"second_hand_transaction/internal/logger"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func main() {
	logger.InitLogger()
	database.DBInit()
	database.InitRedis()
	defer zap.L().Sync()
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")

}
