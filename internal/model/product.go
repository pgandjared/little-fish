package model

import "time"

type Product struct {
	Id          uint      `gorm:"primary_key"`
	UserId      string    `gorm:"index"`
	Name        string    `gorm:"type:varchar(255)"`
	Description string    `gorm:"type:text"`
	Cost        uint      `gorm:"type:int"`
	CreateTime  time.Time `gorm:"autoCreateTime"`
	UpdateTime  time.Time `gorm:"autoUpdateTime"`
	DeleteTime  time.Time `gorm:"index"`
	Image       string    `gorm:"type:varchar(512)"`
}
type EasyShowProduct struct {
	Name  string
	Image string
}
