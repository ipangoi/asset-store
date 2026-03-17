package middleware

import (
	"asset-store/internal/config"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func RateLimiter(prefix string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		key := fmt.Sprintf("rate_limit:%s:%s", prefix, ip)

		count, err := config.RedisClient.Incr(config.Ctx, key).Result()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			c.Abort()
			return
		}

		if count == 1 {
			config.RedisClient.Expire(config.Ctx, key, window)
		}

		if count > int64(limit) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
			c.Abort()
			return
		}

		c.Next()
	}
}
