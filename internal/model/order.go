//订单数据实体模型

package model

import "time"

type Order struct {
	Id         uint      `gorm:"primary_key;auto_increment"`
	BuyerId    string    `gorm:"type:varchar(255);index"`
	SellerId   string    `gorm:"type:varchar(255);index"`
	ProductId  uint      `gorm:"index"`
	Status     int       `gorm:"type:int;default:0"` // 0: 创建, 1: 已支付, 2: 已发货, 3: 已完成, 4: 已取消
	Cost       uint      `gorm:"type:int"`
	CreateTime time.Time `gorm:"autoCreateTime"`
	UpdateTime time.Time `gorm:"autoUpdateTime"`
	DeleteTime time.Time `gorm:"index"`
}
