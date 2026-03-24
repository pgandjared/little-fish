//数据层crud对数据库进行操作

package repository

import (
	"second_hand_transaction/internal/model"

	"gorm.io/gorm"
)

type ProductRepo struct {
	db *gorm.DB
}

func NewProductRepo(db *gorm.DB) *ProductRepo {
	return &ProductRepo{db: db}
}
func (r *ProductRepo) CreateProduct(product *model.Product) error {
	return r.db.Create(product).Error
}
func (r *ProductRepo) DeleteProduct(id uint) error {
	var product model.Product
	return r.db.Where("id = ?", id).Delete(&product).Error
}
func (r *ProductRepo) GetProduct(name string) ([]model.Product, error) {
	var product []model.Product
	return product, r.db.Where("name = ?", name).Find(&product).Error
}
func (r *ProductRepo) GetIDProduct(id uint) (model.Product, error) {
	var product model.Product
	return product, r.db.Where("id=?", id).First(&product).Error
}
func (r *ProductRepo) ListProducts() ([]model.Product, error) {
	var products []model.Product
	return products, r.db.Find(&products).Error
}

// gorm.save有则更新，没有则插入
func (r *ProductRepo) UpdateProduct(product *model.Product) error {
	return r.db.Save(product).Error
}
