//服务创建

package service

import (
	"context"
	"encoding/json"
	"errors"
	"second_hand_transaction/internal/model"
	"second_hand_transaction/internal/repository"
	"time"

	"github.com/redis/go-redis/v9"
)

type ProductSvc struct {
	Repo    *repository.ProductRepo
	Redisdb *redis.Client
}

func NewProductSvc(repo *repository.ProductRepo, redis *redis.Client) *ProductSvc {
	return &ProductSvc{Repo: repo, Redisdb: redis}
}
func (s *ProductSvc) Create(name, description, userId string, cost uint, image string) error {
	product := model.Product{
		Name:        name,
		Description: description,
		Cost:        cost,
		UserId:      userId,
		Image:       image,
	}
	err := s.Repo.CreateProduct(&product)
	if err == nil {
		s.Redisdb.Del(context.Background(), "product")
		return nil
	}
	return errors.New("product not created")
}

func (s *ProductSvc) Update(name, description, userId string, id, cost uint, image string) error {
	product := model.Product{
		Name:        name,
		Description: description,
		Cost:        cost,
		UserId:      userId,
		Image:       image,
	}
	//userid是否匹配其所有人，匹配则更新
	getProduct, err := s.Repo.GetIDProduct(id)
	if err != nil {

		return errors.New("product not found")
	}
	if !(userId == getProduct.UserId) {
		return errors.New("你未持有商品，无法修改")
	}

	err = s.Repo.UpdateProduct(&product)
	if err == nil {
		s.Redisdb.Del(context.Background(), "product")
		return nil
	}
	return errors.New("product not updated")
}
func (s *ProductSvc) Del(userId string, id uint) error {
	getProduct, err := s.Repo.GetIDProduct(id)
	if err != nil {
		return errors.New("product not found")
	}
	if !(userId == getProduct.UserId) {
		return errors.New("你未持有商品，无法修改")
	}
	err = s.Repo.DeleteProduct(id)
	if err == nil {
		s.Redisdb.Del(context.Background(), "product")
		return nil
	}
	return errors.New("product not deleted")
}
func (s *ProductSvc) List() ([]model.EasyShowProduct, error) {
	key := "products"
	var product []model.Product
	//全部展示，只展示名字和图片
	var listProducts []model.EasyShowProduct

	//先从redis查询
	val, err := s.Redisdb.Get(context.Background(), key).Result()
	if err == nil {
		//反序列化为需要格式
		err = json.Unmarshal([]byte(val), &product)
		for _, products := range product {
			listProducts = append(listProducts, model.EasyShowProduct{Name: products.Name, Image: products.Image})
		}
		return listProducts, err
	}
	product, err = s.Repo.ListProducts()
	if err != nil {
		return nil, err
	}
	//序列化弄入redis
	data, err := json.Marshal(&product)
	s.Redisdb.Set(context.Background(), key, data, 10*time.Minute)
	for _, products := range product {
		listProducts = append(listProducts, model.EasyShowProduct{Name: products.Name, Image: products.Image})
	}
	return listProducts, nil
}
func (s *ProductSvc) GetByName(name string) ([]model.Product, error) {
	var product []model.Product
	//依旧redis查看命中，使用for range搜索redis查看的所有数据
	val, err := s.Redisdb.Get(context.Background(), "products").Result()
	if err == nil {
		err = json.Unmarshal([]byte(val), &product)
		for _, p := range product {
			if p.Name == name {
				var products []model.Product
				products = append(products, p)
				return products, err
			}
		}
	}
	//未命中redis，从数据库查询并录入redis中
	product, err = s.Repo.GetProduct(name)
	if err != nil {
		return nil, err
	}
	data, err := json.Marshal(&product)
	s.Redisdb.Set(context.Background(), "products", data, 10*time.Minute)
	return product, nil
}
