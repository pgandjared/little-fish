package model

type User struct {
	Id         uint   `gorm:"primary_key;auto_increment;column:id"`
	ExternalId string `gorm:"type:varchar(255);unique;column:external_id"`
	Name       string `gorm:"type:varchar(255);unique;column:name"`
	Image      string `gorm:"type:varchar(512);column:image"`
}

func (User) TableName() string {
	return "users"
}
