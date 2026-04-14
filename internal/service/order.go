//服务创建

package service

import (
	"errors"
	"second_hand_transaction/internal/model"
	"second_hand_transaction/internal/repository"
)

// 订单状态枚举
const (
	OrderStatusCreated   = 0
	OrderStatusPaid      = 1
	OrderStatusShipped   = 2
	OrderStatusCompleted = 3
	OrderStatusCancelled = 4
)

type OrderSvc struct {
	Repo        *repository.OrderRepo
	ProductRepo *repository.ProductRepo
}

func NewOrderSvc(repo *repository.OrderRepo, productRepo *repository.ProductRepo) *OrderSvc {
	return &OrderSvc{Repo: repo, ProductRepo: productRepo}
}

func (s *OrderSvc) CreateOrder(buyerId string, productId uint) (*model.Order, error) {
	// 获取商品信息以及对应卖家和价格
	product, err := s.ProductRepo.GetIDProduct(productId)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if product.UserId == buyerId {
		return nil, errors.New("cannot buy your own product")
	}

	order := &model.Order{
		BuyerId:   buyerId,
		SellerId:  product.UserId,
		ProductId: productId,
		Status:    OrderStatusCreated,
		Cost:      product.Cost,
	}

	if err := s.Repo.CreateOrder(order); err != nil {
		return nil, err
	}
	return order, nil
}

func (s *OrderSvc) UpdateOrderStatus(userId string, orderId uint, action string) error {
	order, err := s.Repo.GetOrder(orderId)
	if err != nil {
		return errors.New("order not found")
	}

	// 状态机流转逻辑
	switch action {
	case "pay":
		if order.BuyerId != userId {
			return errors.New("only buyer can pay")
		}
		if order.Status != OrderStatusCreated {
			return errors.New("invalid state transition: order is not in created state")
		}
		order.Status = OrderStatusPaid
	case "ship":
		if order.SellerId != userId {
			return errors.New("only seller can ship")
		}
		if order.Status != OrderStatusPaid {
			return errors.New("invalid state transition: order is not in paid state")
		}
		order.Status = OrderStatusShipped
	case "complete":
		if order.BuyerId != userId {
			return errors.New("only buyer can complete")
		}
		if order.Status != OrderStatusShipped {
			return errors.New("invalid state transition: order is not in shipped state")
		}
		order.Status = OrderStatusCompleted
	case "cancel":
		if order.BuyerId != userId && order.SellerId != userId {
			return errors.New("only buyer or seller can cancel")
		}
		if order.Status >= OrderStatusShipped {
			return errors.New("invalid state transition: cannot cancel shipped/completed order")
		}
		order.Status = OrderStatusCancelled
	default:
		return errors.New("invalid action")
	}

	return s.Repo.UpdateOrder(order)
}

func (s *OrderSvc) ListOrders(userId string, role string) ([]model.Order, error) {
	if role == "seller" {
		return s.Repo.ListBySeller(userId)
	}
	// 默认为买家角色
	return s.Repo.ListByBuyer(userId)
}
