//数据层crud对数据库进行操作

package repository

import (
	"second_hand_transaction/internal/model"

	"gorm.io/gorm"
)

type MessageRepo struct {
	db *gorm.DB
}

func NewMessageRepo(db *gorm.DB) *MessageRepo {
	return &MessageRepo{db: db}
}

func (r *MessageRepo) CreateMessage(message *model.Message) error {
	return r.db.Create(message).Error
}

func (r *MessageRepo) GetChatHistory(user1, user2 string) ([]model.Message, error) {
	var messages []model.Message
	err := r.db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		user1, user2, user2, user1).Order("create_time asc").Find(&messages).Error
	return messages, err
}
