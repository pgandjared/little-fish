//聊天消息通信实体模型

package model

import "time"

type Message struct {
	Id         uint      `gorm:"primary_key;auto_increment"`
	SenderId   string    `gorm:"type:varchar(255);index"`
	ReceiverId string    `gorm:"type:varchar(255);index"`
	Content    string    `gorm:"type:text"`
	CreateTime time.Time `gorm:"autoCreateTime"`
}
