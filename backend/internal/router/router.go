package router

import (
	"asset-store/internal/database"
	"asset-store/internal/handler"
	"asset-store/internal/middleware"
	"asset-store/internal/repository"
	"asset-store/internal/service"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func StartApp() *gin.Engine {
	db := database.ConnectDB()
	r := gin.Default()

	//cors setup

	frontendURL := os.Getenv("FRONTEND_URL")
	allowedOrigins := []string{"http://localhost:3000"}
	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	//init user
	userRepository := repository.NewUserRepositoryImpl(db)
	userService := service.NewUserServiceImpl(userRepository)
	userHandler := handler.NewUserHandlerImpl(userService)

	//init product
	productRepo := repository.NewProductRepositoryImpl(db)
	productService := service.NewProductServiceImpl(productRepo, userRepository)

	//init transaction
	transactionRepo := repository.NewTransactionRepositoryImpl(db)
	transactionService := service.NewTransactionServiceImpl(transactionRepo, userRepository, productRepo)
	transactionHandler := handler.NewTransactionHandlerImpl(transactionService)

	// product
	productHandler := handler.NewProductHandlerImpl(productService, transactionService)

	//user
	userRouter := r.Group("/user")
	{
		userRouter.POST("/register", userHandler.Register)
		userRouter.POST("/login", userHandler.Login)
		privateUser := userRouter.Group("")
		privateUser.Use(middleware.AuthMiddleware())
		{
			privateUser.GET("/profile", userHandler.GetProfileByID)
			privateUser.PUT("/profile", userHandler.UpdateProfile)

			privateUser.PUT("/role", userHandler.UpdateRole)

			privateUser.GET("/saved", productHandler.GetSavedProducts)
			privateUser.GET("/saved-ids", productHandler.GetSavedProductIDs)
		}
	}

	//product
	productRouter := r.Group("/product")
	{
		productRouter.GET("", productHandler.GetAllProduct)
		productRouter.GET("/:id", productHandler.GetProductByID)
		privateProduct := productRouter.Group("")
		privateProduct.Use(middleware.AuthMiddleware())
		{
			privateProduct.GET("/my-product", productHandler.GetMyProducts)
			privateProduct.POST("", productHandler.CreateProduct)
			privateProduct.PUT("/:id", productHandler.UpdateProduct)
			privateProduct.DELETE("/:id", productHandler.DeleteProduct)
			privateProduct.POST("/:id/save", productHandler.ToggleSaveProduct)
			privateProduct.GET("/:id/download", productHandler.DownloadProduct)
		}
	}

	//transaction
	transactionRouter := r.Group("/transaction")
	{
		transactionRouter.POST("/notification", transactionHandler.MidtransWebhook)
		privateTransaction := transactionRouter.Group("")
		privateTransaction.Use(middleware.AuthMiddleware())
		{
			privateTransaction.POST("", transactionHandler.CreateTransaction)
			privateTransaction.GET("", transactionHandler.GetUserTransactions)
		}
	}

	return r
}
