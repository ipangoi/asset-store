package dto

import "mime/multipart"

type CreateProductRequest struct {
	Title       string                `form:"title" binding:"required"`
	Description string                `form:"description" binding:"required"`
	Price       int                   `form:"price" binding:"gte=0"`
	Thumbnail   *multipart.FileHeader `form:"thumbnail" binding:"required"`
	AssetFile   *multipart.FileHeader `form:"asset_file" binding:"required"`
}

type ProductResponse struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Price        int    `json:"price"`
	ThumbnailURL string `json:"thumbnail_url"`
	AssetFileKey string `json:"-"`
	SellerID     string `json:"seller_id"`
	SellerName   string `json:"seller_name"`
}

type UpdateProductRequest struct {
	Title        string                `form:"title"`
	Description  string                `form:"description"`
	Price        int                   `form:"price" binding:"gte=0"`
	Thumbnail    *multipart.FileHeader `form:"thumbnail"`
	AssetFile    *multipart.FileHeader `form:"asset_file"`
	ThumbnailURL string
	AssetFileURL string
}
