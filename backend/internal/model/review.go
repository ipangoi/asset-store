package model

import "github.com/google/uuid"

type Review struct {
	GormModel
	ProductID uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Rating    int       `gorm:"type:int;not null" json:"rating"`
	Comment   string    `gorm:"type:text;not null" json:"comment"`

	User User `gorm:"foreignKey:UserID" json:"user"`
}
