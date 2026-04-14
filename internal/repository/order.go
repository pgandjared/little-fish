//数据层crud对数据库进行操作

package repository

import (
	"second_hand_transaction/internal/model"

	"gorm.io/gorm"
)

type OrderRepo struct {
	db *gorm.DB
}

func NewOrderRepo(db *gorm.DB) *OrderRepo {
	return &OrderRepo{db: db}
}

func (r *OrderRepo) CreateOrder(order *model.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepo) GetOrder(id uint) (*model.Order, error) {
	var order model.Order
	err := r.db.Where("id = ?", id).First(&order).Error
	return &order, err
}

func (r *OrderRepo) UpdateOrder(order *model.Order) error {
	return r.db.Save(order).Error
}

func (r *OrderRepo) ListByBuyer(buyerId string) ([]model.Order, error) {
	var orders []model.Order
	err := r.db.Where("buyer_id = ?", buyerId).Order("create_time desc").Find(&orders).Error
	return orders, err
}

func (r *OrderRepo) ListBySeller(sellerId string) ([]model.Order, error) {
	var orders []model.Order
	err := r.db.Where("seller_id = ?", sellerId).Order("create_time desc").Find(&orders).Error
	return orders, err
}
