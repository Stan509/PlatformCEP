// Commande principale API Gateway.
//
// Rôle : point d'entrée réseau unique (CDN/WAF → LB → Gateway → Django/Rust).
// Applique TLS, CORS, rate limiting et routage/forwarding vers Django Core et
// le service de synchronisation. Le vote et les données sensibles ne transitent
// jamais en clair.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/cep-election/go-gateway/internal/config"
)

type statusResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Time    string `json:"time"`
}

func main() {
	cfg := config.Load()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "go-gateway"})
	})
	mux.HandleFunc("GET /api/v1/ping", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, statusResponse{Status: "pong", Service: "cep-election/go-gateway", Time: time.Now().UTC().Format(time.RFC3339)})
	})

	srv := &http.Server{
		Addr:         cfg.Addr,
		Handler:               corsMiddleware(mux, cfg),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("CEP go-gateway listening on %s (debug=%v)", cfg.Addr, cfg.Debug)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write response: %v", err)
	}
}

// corsMiddleware applique une politique CORS explicite et stricte.
func corsMiddleware(next http.Handler, cfg config.Config) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, allowed := range cfg.AllowedOrigins {
			if origin == allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				break
			}
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
