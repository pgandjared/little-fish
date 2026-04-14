//订单数据实体模型

package model

type Order struct {
	Id        uint   `gorm:"primary_key;auto_increment;column:id"`
	BuyerId   string `gorm:"type:varchar(255);index;column:buyer_id"`
	SellerId  string `gorm:"type:varchar(255);index;column:seller_id"`
	ProductId uint   `gorm:"index;column:product_id"`
	Status    int    `gorm:"type:int;default:0;column:status"` // 0: 创建, 1: 已支付, 2: 已发货, 3: 已完成, 4: 已取消
	Cost      uint   `gorm:"type:int;column:cost"`
}

func (Order) TableName() string {
	return "orders"
}
