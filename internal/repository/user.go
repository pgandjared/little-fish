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
func (r *UserRepo) SyncCasdoorInfo(externalID, name string) error {
	var user model.User
	err := r.db.Where(model.User{ExternalId: externalID}).Assign(model.User{Name: name}).FirstOrCreate(&user).Error
	return err
}
