//聊天消息通信实体模型

package model

type Message struct {
	Id         uint   `gorm:"primary_key;auto_increment;column:id"`
	SenderId   string `gorm:"type:varchar(255);index;column:sender_id"`
	ReceiverId string `gorm:"type:varchar(255);index;column:receiver_id"`
	Content    string `gorm:"type:text;column:content"`
}

func (Message) TableName() string {
	return "messages"
}
