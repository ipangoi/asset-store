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

	//init repo
	userRepository := repository.NewUserRepositoryImpl(db)
	productRepo := repository.NewProductRepositoryImpl(db)
	transactionRepo := repository.NewTransactionRepositoryImpl(db)
	categoryRepo := repository.NewCategoryRepositoryImpl(db)
	reviewRepo := repository.NewReviewRepositoryImpl(db)

	//init service
	userService := service.NewUserServiceImpl(userRepository, reviewRepo)
	productService := service.NewProductServiceImpl(productRepo, userRepository, reviewRepo)
	transactionService := service.NewTransactionServiceImpl(transactionRepo, userRepository, productRepo)
	categoryService := service.NewCategoryServiceImpl(categoryRepo)
	reviewService := service.NewReviewServiceImpl(reviewRepo, productRepo, userRepository)

	//init handler
	userHandler := handler.NewUserHandlerImpl(userService)
	transactionHandler := handler.NewTransactionHandlerImpl(transactionService)
	productHandler := handler.NewProductHandlerImpl(productService, transactionService)
	categoryHandler := handler.NewCategoryHandlerImpl(categoryService)
	reviewHandler := handler.NewReviewHandlerImpl(reviewService)

	//user
	userRouter := r.Group("/user")
	{
		userRouter.POST("/register", userHandler.Register)
		userRouter.POST("/login", userHandler.Login)
		userRouter.GET("/:id", userHandler.GetPublicProfile)
		privateUser := userRouter.Group("")
		privateUser.Use(middleware.AuthMiddleware())
		{
			privateUser.GET("/profile", userHandler.GetProfileByID)
			privateUser.PUT("/profile", userHandler.UpdateProfile)

			privateUser.PUT("/role", userHandler.UpdateRole)

			privateUser.GET("/saved", productHandler.GetSavedProducts)
			privateUser.GET("/saved-ids", productHandler.GetSavedProductIDs)

			// get my-product (change in fe)
			privateUser.GET("/my-product", productHandler.GetMyProducts)
		}
	}

	//product
	productRouter := r.Group("/product")
	{
		productRouter.GET("", productHandler.GetAllProduct)
		productRouter.GET("/:id", productHandler.GetProductByID)
		productRouter.GET("/:id/reviews", reviewHandler.GetAllReviewByProduct)
		privateProduct := productRouter.Group("")
		privateProduct.Use(middleware.AuthMiddleware())
		{
			privateProduct.POST("", productHandler.CreateProduct)
			privateProduct.PUT("/:id", productHandler.UpdateProduct)
			privateProduct.DELETE("/:id", productHandler.DeleteProduct)
			privateProduct.POST("/:id/save", productHandler.ToggleSaveProduct)
			privateProduct.GET("/:id/download", productHandler.DownloadProduct)

			// create review
			privateProduct.POST("/:id/reviews", reviewHandler.CreateReview)
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

	// category
	categoryRouter := r.Group("/category")
	{
		categoryRouter.GET("", categoryHandler.GetAllCategory)
	}

	//review
	reviewRouter := r.Group("/review")
	{
		privateReview := reviewRouter.Group("")
		privateReview.Use(middleware.AuthMiddleware())
		{
			privateReview.PUT("/:id", reviewHandler.UpdateReview)
			privateReview.DELETE("/:id", reviewHandler.DeleteReview)
		}
	}

	return r
}
