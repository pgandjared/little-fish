package model

import "time"

type Product struct {
	Id          uint      `gorm:"primary_key"`
	UserId      uint      `gorm:"index"`
	Name        string    `gorm:"type:varchar(255)"`
	Description string    `gorm:"type:text"`
	Cost        uint      `gorm:"type:int"`
	CreateTime  time.Time `gorm:"autoCreateTime"`
	UpdateTime  time.Time `gorm:"autoUpdateTime"`
	DeleteTime  time.Time `gorm:"index"`
}
type EasyShowProduct struct {
	Name string
}
