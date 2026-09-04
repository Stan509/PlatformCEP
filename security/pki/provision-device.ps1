# CEP — Provisioning d'un appareil de terrain (outillage DEMO)
#
# Génère une paire de clés avec le core Rust (crypto-cli), enregistre la clé
# publique dans le registre et charge la clé privée dans un keystore local.
#
# ⚠️ Ce script est un OUTIL DE DÉVELOPPEMENT. En production, la clé privée est
# générée sur l'appareil dans un keystore matériel et jamais exportée.
param(
    [Parameter(Mandatory=$true)][string]$DeviceId
)

$ErrorActionPreference = "Stop"
$bin = if ($env:CRYPTO_CLI_BIN) { $env:CRYPTO_CLI_BIN } else { "crypto-cli" }

Write-Host "Génération de la paire de clés pour $DeviceId ..."
$output = & $bin keygen
if ($LASTEXITCODE -ne 0) { throw "crypto-cli keygen a échoué" }

$privateHex = ($output | Select-String '^private=').ToString().Split('=', 2)[1]
$publicHex  = ($output | Select-String '^public=').ToString().Split('=', 2)[1]

# Keystore local (démo) — en production, charger dans un HSM / keystore matériel.
$keystore = Join-Path $PSScriptRoot "keys/$DeviceId.private"
Set-Content -Path $keystore -Value $privateHex
Write-Host "Clé privée (DEMO) -> $keystore"

# Enregistrement de la clé publique (démo) : à ajouter à DEVICE_PUBLIC_KEYS du serveur.
Write-Host ""
Write-Host "Ajoutez au serveur de synchronisation :"
Write-Host "  DEVICE_PUBLIC_KEYS += $DeviceId`:$publicHex"
