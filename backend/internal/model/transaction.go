package model

import "github.com/google/uuid"

type Transaction struct {
	GormModel
	OrderID         string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"order_id"`
	UserID          uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	ProductID       uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Amount          int       `gorm:"type:int;not null" json:"amount"`
	Status          string    `gorm:"type:varchar(50);default:'pending'" json:"status"`
	SnapToken       string    `gorm:"type:varchar(255)" json:"snap_token"`
	SnapRedirectURL string    `gorm:"type:varchar(255)" json:"snap_redirect_url"`

	User    *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
