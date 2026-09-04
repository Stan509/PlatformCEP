// Package config charge la configuration de l'API Gateway.
// Les valeurs sensibles proviennent de variables d'environnement, jamais du code.
package config

import (
	"os"
	"strconv"
	"strings"
)

// Config représente la configuration de l'API Gateway.
type Config struct {
	Addr        string
	Debug       bool
	AllowedOrigins []string
	RateLimitPerMin int
}

// Load construit la configuration à partir des variables d'environnement.
func Load() Config {
	return Config{
		Addr:        getenv("GATEWAY_ADDR", ":8080"),
		Debug:       getenvBool("GATEWAY_DEBUG", false),
		AllowedOrigins: split(getenv("GATEWAY_ALLOWED_ORIGINS", "http://localhost:3000")),
		RateLimitPerMin: getenvInt("GATEWAY_RATE_LIMIT", 600),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getenvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			return b
		}
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil {
			return n
		}
	}
	return fallback
}

func split(value string) []string {
	if value == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
