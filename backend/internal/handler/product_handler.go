package handler

import "github.com/gin-gonic/gin"

type ProductHandler interface {
	CreateProduct(c *gin.Context)
	GetAllProduct(c *gin.Context)
	GetProductByID(c *gin.Context)
	UpdateProduct(c *gin.Context)
	DeleteProduct(c *gin.Context)
	GetMyProducts(c *gin.Context)

	ToggleSaveProduct(c *gin.Context)
	GetSavedProducts(c *gin.Context)
	GetSavedProductIDs(c *gin.Context)

	DownloadProduct(c *gin.Context)
}
