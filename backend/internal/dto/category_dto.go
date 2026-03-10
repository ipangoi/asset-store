package dto

type CategoryResponse struct {
	ID   string `json:"id"`
	Name string `json:"category_name"`
	Slug string `json:"slug"`
}
