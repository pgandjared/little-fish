package model

import "time"

type User struct {
	Id uint `gorm:"primary_key;auto_increment"`

	CreateTime time.Time `gorm:"autoCreateTime"`
	UpdateTime time.Time `gorm:"autoUpdateTime"`
	DeleteTime time.Time `gorm:"index"`
	ExternalId string    `gorm:"type:varchar(255);unique"`
	Name       string    `gorm:"type:varchar(255);unique"`
	Image      string    `gorm:"type:varchar(512)"`
}
