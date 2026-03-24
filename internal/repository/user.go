package repository

import (
	"second_hand_transaction/internal/model"

	"gorm.io/gorm"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}
func (r *UserRepo) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}
func (r *UserRepo) GetUser(username string) (*model.User, error) {
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}
