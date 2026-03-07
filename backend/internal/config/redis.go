package config

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

var RedisClient *redis.Client

func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL is not set in .env")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal(err)
	}

	client := redis.NewClient(opt)

	RedisClient = client

	_, err = RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Redis connection success")
}
