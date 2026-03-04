// backend/entity/product.go
package model

import "github.com/google/uuid"

type Product struct {
	GormModel
	UserID       uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Title        string    `gorm:"type:varchar(255);not null" json:"title"`
	Description  string    `gorm:"type:text" json:"description"`
	Price        int       `gorm:"type:int;not null" json:"price"`
	ThumbnailURL string    `gorm:"type:varchar(255)" json:"thumbnail_url"`
	AssetFileKey string    `gorm:"type:varchar(255);not null" json:"asset_file_key"`

	User         *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:ProductID" json:"transactions,omitempty"`
}

type SavedProduct struct {
	GormModel
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`

	User    *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
