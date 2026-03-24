package model

import "time"

type User struct {
	Id uint `gorm:"primary_key"`

	CreateTime time.Time `gorm:"autoCreateTime"`
	UpdateTime time.Time `gorm:"autoUpdateTime"`
	DeleteTime time.Time `gorm:"index"`

	Name     string `gorm:"type:varchar(255);unique"`
	Password string `gorm:"type:varchar(255);not_null"`
}
