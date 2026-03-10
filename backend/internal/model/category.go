package model

type Category struct {
	GormModel
	Name string `gorm:"type:varchar(100);not null" json:"category_name"`
	Slug string `gorm:"type:varchar(100);unique;not null" json:"slug"`

	Products []Product `gorm:"foreignKey:CategoryID" json:"products"`
}
