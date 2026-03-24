//连接数据库

package database

import (
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func DBInit() *gorm.DB {
	dsn := viper.GetString("database.dsn")
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		zap.L().Panic("连接数据库失败" + err.Error())
	}
	zap.L().Info("连接数据库成功")
	DBMigrate("./sql", dsn)
	return DB
}

// DBMigrate 数据库迁移，代替gorm.model
func DBMigrate(DBUrl string, dsn string) {

	m, err := migrate.New("file://"+DBUrl, "mysql://"+dsn)
	if err != nil {
		zap.L().Panic("初始化迁移失败" + err.Error())
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		zap.L().Panic("执行sql失败" + err.Error())
	}
	zap.L().Info("执行数据库迁移成功")
}
