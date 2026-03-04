package model

type User struct {
	GormModel
	Email        string `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string `gorm:"type:varchar(255);not null" json:"-"`
	Role         string `gorm:"type:varchar(20);default:'buyer'" json:"role"`
	Name         string `gorm:"type:varchar(100)" json:"name"`

	Products     []Product     `gorm:"foreignKey:UserID" json:"products,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:UserID" json:"transactions,omitempty"`
}
