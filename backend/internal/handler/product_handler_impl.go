package handler

import (
	"asset-store/internal/dto"
	"asset-store/internal/service"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	storage_go "github.com/supabase-community/storage-go"
)

type ProductHandlerImpl struct {
	productService     service.ProductService
	transactionService service.TransactionService
}

func NewProductHandlerImpl(productService service.ProductService, transactionService service.TransactionService) ProductHandler {
	return &ProductHandlerImpl{
		productService:     productService,
		transactionService: transactionService,
	}
}

func (h *ProductHandlerImpl) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest

	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	timestamp := time.Now().Unix()
	thumbnailFileName := fmt.Sprintf("%d_%s", timestamp, filepath.Base(req.Thumbnail.Filename))
	assetFileName := fmt.Sprintf("%d_%s", timestamp, filepath.Base(req.AssetFile.Filename))

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
	storageClient := storage_go.NewClient(supabaseURL+"/storage/v1", supabaseKey, nil)

	thumbnailFile, err := req.Thumbnail.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open thumbnail"})
		return
	}
	defer thumbnailFile.Close()

	_, err = storageClient.UploadFile("assets-storage", thumbnailFileName, thumbnailFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	assetFile, err := req.AssetFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open asset file"})
		return
	}
	defer assetFile.Close()

	_, err = storageClient.UploadFile("assets-storage", assetFileName, assetFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload asset to cloud"})
		return
	}

	thumbnailURL := fmt.Sprintf("%s/storage/v1/object/public/assets-storage/%s", supabaseURL, thumbnailFileName)
	assetURL := fmt.Sprintf("%s/storage/v1/object/public/assets-storage/%s", supabaseURL, assetFileName)

	res, err := h.productService.CreateProduct(req.Title, req.Description, req.Price, thumbnailURL, assetURL, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (h *ProductHandlerImpl) GetAllProduct(c *gin.Context) {
	searchQuery := c.Query("q")

	limitStr := c.Query("limit")
	limit, _ := strconv.Atoi(limitStr)

	res, err := h.productService.GetAllProducts(searchQuery, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ProductHandlerImpl) GetProductByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	res, err := h.productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ProductHandlerImpl) UpdateProduct(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))

	var req dto.UpdateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
	storageClient := storage_go.NewClient(supabaseURL+"/storage/v1", supabaseKey, nil)

	if req.Thumbnail != nil {
		filename := uuid.New().String() + "-" + filepath.Base(req.Thumbnail.Filename)

		file, err := req.Thumbnail.Open()
		if err == nil {
			defer file.Close()
			_, err = storageClient.UploadFile("assets-storage", filename, file)
			if err == nil {
				req.ThumbnailURL = fmt.Sprintf("%s/storage/v1/object/public/assets-storage/%s", supabaseURL, filename)
			}
		}
	}

	if req.AssetFile != nil {
		filename := uuid.New().String() + "-" + filepath.Base(req.AssetFile.Filename)

		file, err := req.AssetFile.Open()
		if err == nil {
			defer file.Close()
			_, err = storageClient.UploadFile("assets-storage", filename, file)
			if err == nil {
				req.AssetFileURL = fmt.Sprintf("%s/storage/v1/object/public/assets-storage/%s", supabaseURL, filename)
			}
		}
	}

	userID := c.MustGet("user_id").(uuid.UUID)
	res, err := h.productService.UpdateProduct(id, req, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ProductHandlerImpl) DeleteProduct(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))
	userID := c.MustGet("user_id").(uuid.UUID)

	err := h.productService.DeleteProduct(id, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}

func (h *ProductHandlerImpl) GetMyProducts(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	res, err := h.productService.GetProductsBySeller(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// Save Product Implementation
func (h *ProductHandlerImpl) ToggleSaveProduct(c *gin.Context) {
	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID format"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	message, err := h.productService.ToggleSaveProduct(userID, productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}

func (h *ProductHandlerImpl) GetSavedProducts(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	res, err := h.productService.GetSavedProducts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ProductHandlerImpl) GetSavedProductIDs(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	ids, err := h.productService.GetSavedProductIDs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if ids == nil {
		ids = []string{}
	}

	c.JSON(http.StatusOK, gin.H{"saved_ids": ids})
}

func (h *ProductHandlerImpl) DownloadProduct(c *gin.Context) {
	productID, _ := uuid.Parse(c.Param("id"))
	userID := c.MustGet("user_id").(uuid.UUID)

	isAuthorized := h.transactionService.VerifyPurchase(userID, productID)

	if !isAuthorized {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied! You must purchase this product first."})
		return
	}

	product, err := h.productService.GetProductByID(productID)
	if err != nil || product.AssetFileKey == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	downloadURL := product.AssetFileKey

	fileName := url.QueryEscape(product.Title + ".zip")

	if strings.Contains(downloadURL, "?") {
		downloadURL += "&download=" + fileName
	} else {
		downloadURL += "?download=" + fileName
	}

	c.Redirect(http.StatusTemporaryRedirect, downloadURL)
}
