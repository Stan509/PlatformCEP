// Package sync modélise la synchronisation sécurisée des transactions locales.
//
// PRINCIPE (Document Maître §24-25) : le serveur ne fait JAMAIS confiance à un
// compteur fourni uniquement par le client. Chaque transaction offline est
// identifiée, signée, horodatée par une source de temps de confiance,
// séquencée, protégée contre le replay et vérifiée côté serveur.
//
// La vérification cryptographique réelle est déléguée au core Rust
// (`@cep/crypto-core`). Ici : structure + pipeline (Phase 3).
package sync

// Transaction représente une opération offline à synchroniser.
type Transaction struct {
	TransactionID     string `json:"transaction_id"`
	DeviceID          string `json:"device_id"`
	Sequence          uint64 `json:"sequence"`
	CreatedAt         string `json:"created_at"`
	TrustedTimeRef    string `json:"trusted_time_reference"`
	PayloadHash       string `json:"payload_hash"`
	Signature         string `json:"signature"`
	PreviousTxHash    string `json:"previous_transaction_hash"`
	Payload           []byte `json:"payload"`
}

// Verdict est le résultat de la validation serveur d'une transaction.
type Verdict struct {
	Accepted bool   `json:"accepted"`
	Reason   string `json:"reason,omitempty"`
}

// Validator vérifie l'intégrité et l'authenticité d'une transaction.
type Validator interface {
	Validate(tx Transaction) Verdict
}

// Pipeline traite une file de transactions signées de façon séquentielle.
type Pipeline struct {
	validator Validator
	lastSeq   map[string]uint64 // deviceID -> dernière séquence acceptée
}

// NewPipeline crée un pipeline de synchronisation.
func NewPipeline(v Validator) *Pipeline {
	return &Pipeline{validator: v, lastSeq: make(map[string]uint64)}
}

// EnsureFIFO applique une validation de séquence strictement croissante par
// appareil (anti-replay, anti-rollback). Le compteur serveur fait foi.
func (p *Pipeline) EnsureFIFO(tx Transaction) Verdict {
	last, ok := p.lastSeq[tx.DeviceID]
	if ok && tx.Sequence <= last {
		return Verdict{Accepted: false, Reason: "replay_or_out_of_order_sequence"}
	}
	if v := p.validator.Validate(tx); !v.Accepted {
		return v
	}
	p.lastSeq[tx.DeviceID] = tx.Sequence
	return Verdict{Accepted: true}
}
