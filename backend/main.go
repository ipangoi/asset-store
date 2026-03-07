package main

import (
	"asset-store/internal/config"
	"asset-store/internal/router"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/midtrans/midtrans-go"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Env file not found.")
	}

	midtrans.ServerKey = os.Getenv("MIDTRANS_SERVER_KEY")
	midtrans.Environment = midtrans.Sandbox

	config.InitRedis()

	r := router.StartApp()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
