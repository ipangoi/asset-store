package handler

import (
	"asset-store/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryHandlerImpl struct {
	categoryService service.CategoryService
}

func NewCategoryHandlerImpl(categoryService service.CategoryService) CategoryHandler {
	return &CategoryHandlerImpl{categoryService}
}

// GetAllCategory implements [CategoryHandler].
func (h *CategoryHandlerImpl) GetAllCategory(c *gin.Context) {
	res, err := h.categoryService.GetAllCategory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}
