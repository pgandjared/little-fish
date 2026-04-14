package model

type Product struct {
	Id          uint   `gorm:"primary_key;column:id"`
	UserId      string `gorm:"index;column:user_id"`
	Name        string `gorm:"type:varchar(255);column:name"`
	Description string `gorm:"type:text;column:description"`
	Cost        uint   `gorm:"type:int;column:cost"`
	Image       string `gorm:"type:varchar(512);column:image"`
}

func (Product) TableName() string {
	return "product"
}

type EasyShowProduct struct {
	Name  string
	Image string
}
