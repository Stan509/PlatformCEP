package sync

// MemoryKeyStore stocke les clés publiques d'appareils en mémoire.
// En production : remplacer par une source alimentée par la PKI / Django.
type MemoryKeyStore map[string]string

// PublicKey retourne la clé publique d'un appareil et sa présence.
func (m MemoryKeyStore) PublicKey(deviceID string) (string, bool) {
	key, ok := m[deviceID]
	return key, ok
}
