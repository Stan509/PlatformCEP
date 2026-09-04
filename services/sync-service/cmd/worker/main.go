// Commande worker de synchronisation.
//
// Reçoit depuis l'API Gateway les transactions signées des APK, les valide
// (séquence + intégrité + signature via le core Rust), puis les pousse vers
// Django Core. Principe : le serveur ne fait JAMAIS confiance au compteur client.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/cep-election/sync-service/internal/sync"
)

// loadDeviceKeys construit le registre de clés publiques depuis
// DEVICE_PUBLIC_KEYS au format "device_id:public_hex,device2:public_hex".
func loadDeviceKeys() sync.MemoryKeyStore {
	store := sync.MemoryKeyStore{}
	raw := os.Getenv("DEVICE_PUBLIC_KEYS")
	if raw == "" {
		log.Printf("warning: DEVICE_PUBLIC_KEYS vide — aucune transaction ne sera acceptée")
		return store
	}
	for _, pair := range strings.Split(raw, ",") {
		parts := strings.SplitN(pair, ":", 2)
		if len(parts) != 2 {
			continue
		}
		store[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
	}
	return store
}

func main() {
	validator := &sync.RustValidator{Keys: loadDeviceKeys()}
	pipeline := sync.NewPipeline(validator)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "sync-service"})
	})
	mux.HandleFunc("POST /api/v1/sync/ingest", func(w http.ResponseWriter, r *http.Request) {
		var tx sync.Transaction
		if err := json.NewDecoder(r.Body).Decode(&tx); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"accepted": "false", "reason": "invalid_json"})
			return
		}
		verdict := pipeline.EnsureFIFO(tx)
		if !verdict.Accepted {
			writeJSON(w, http.StatusConflict, verdict)
			return
		}
		// TODO(Phase 6) : persistance vers PostgreSQL via Django Core.
		writeJSON(w, http.StatusOK, verdict)
	})

	addr := getenv("SYNC_ADDR", ":8090")
	srv := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}
	log.Printf("CEP sync-service listening on %s", addr)
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

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
