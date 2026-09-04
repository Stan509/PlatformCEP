package sync

import (
	"os"
	"os/exec"
	"strings"
)

// cryptoCLIBin est le binaire Rust `crypto-core` (surchargeable via
// CRYPTO_CLI_BIN). Il constitue le canal de confiance entre Go et la lib Rust.
const cryptoCLIBin = "crypto-cli"

// runCLI exécute la CLI Rust et retourne sa sortie (stdout).
func runCLI(args ...string) (string, error) {
	bin := os.Getenv("CRYPTO_CLI_BIN")
	if bin == "" {
		bin = cryptoCLIBin
	}
	out, err := exec.Command(bin, args...).Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

// HashMessage calcule le SHA-256 d'un message via le core Rust.
func HashMessage(msg []byte) (string, error) {
	return runCLI("hash", string(msg))
}

// VerifySignature vérifie une signature Ed25519 via le core Rust.
func VerifySignature(publicHex string, msg []byte, signature string) (bool, error) {
	out, err := runCLI("verify", publicHex, string(msg), signature)
	if err != nil {
		return false, err
	}
	return out == "ok", nil
}
