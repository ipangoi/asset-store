// backend/config/database.go
package database

import (
	"asset-store/internal/model"
	"log"
	"os"

	// Sesuaikan nama module dengan yang ada di go.mod kamu
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	// Baca file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using system environment variables")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set in .env")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connection success")

	// Jalankan Auto-Migrate (Otomatis bikin tabel kalau belum ada)
	err = db.AutoMigrate(&model.User{}, &model.Product{}, &model.Transaction{}, &model.SavedProduct{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database Migration completed!")
	return db
}
