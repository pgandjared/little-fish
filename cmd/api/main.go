package main

import (
	"second_hand_transaction/internal/database"
	"second_hand_transaction/internal/handler"
	"second_hand_transaction/internal/logger"
	"second_hand_transaction/internal/middleware"
	"second_hand_transaction/internal/repository"
	"second_hand_transaction/internal/router"
	"second_hand_transaction/internal/service"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func main() {
	logger.InitLogger()
	defer zap.L().Sync()
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")
	if err := viper.ReadInConfig(); err != nil {
		zap.L().Fatal("failed to read config", zap.Error(err))
	}

	middleware.InitCasdoor()

	//初始化，依赖注入
	db := database.DBInit()
	rdb := database.InitRedis()
	productRepo := repository.NewProductRepo(db)
	userRepo := repository.NewUserRepo(db)
	productSvc := service.NewProductSvc(productRepo, rdb)
	userSvc := service.NewUserSvc(userRepo)
	productHandler := handler.NewProductHandler(productSvc, userSvc)
	r := router.InitRouter(productHandler)
	zap.L().Info("服务启动，端口8080")
	err := r.Run("8080")
	if err != nil {
		zap.L().Panic("http启动失败", zap.Error(err))
	}
}
