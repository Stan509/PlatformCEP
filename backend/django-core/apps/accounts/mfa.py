"""Service MFA (TOTP) — authentification forte pour les comptes privilégiés.

Utilise `pyotp` (bibliothèque auditée, standard RFC 6238). Le secret est stocké
côté serveur dans `MFAConfig` ; les codes de secours sont hachés.
"""
import hashlib
import secrets

import pyotp

from .models import MFAConfig, User


def generate_totp_secret() -> str:
    """Génère un secret TOTP (base32)."""
    return pyotp.random_base32()


def build_otp_uri(user: User, secret: str) -> str:
    """URI de provisioning pour les applications d'authentification (RFC 6238)."""
    return pyotp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="CEP")


def verify_totp(secret: str, code: str) -> bool:
    """Vérifie un code TOTP avec une fenêtre de tolérance d'une étape."""
    return pyotp.TOTP(secret).verify(code, valid_window=1)


def enable_mfa(user: User) -> tuple[str, str]:
    """Active le MFA pour un utilisateur, retourne (secret, otpauth_uri)."""
    secret = generate_totp_secret()
    config, _ = MFAConfig.objects.get_or_create(
        user=user, defaults={"totp_secret": secret, "enabled": True}
    )
    if not config.enabled:
        config.totp_secret = secret
        config.enabled = True
        config.save()
    return config.totp_secret, build_otp_uri(user, config.totp_secret)


def generate_backup_codes(user: User, count: int = 8) -> list[str]:
    """Génère des codes de secours à usage unique (hachés côté serveur)."""
    config, _ = MFAConfig.objects.get_or_create(user=user, defaults={"totp_secret": generate_totp_secret()})
    codes = []
    hashes = []
    for _ in range(count):
        code = secrets.token_urlsafe(6)
        codes.append(code)
        hashes.append(hashlib.sha256(code.encode()).hexdigest())
    config.backup_codes_hash = hashes
    config.save(update_fields=["backup_codes_hash"])
    return codes


def verify_backup_code(user: User, code: str) -> bool:
    """Vérifie et consomme un code de secours (usage unique)."""
    config = getattr(user, "mfa", None)
    if not config:
        return False
    digest = hashlib.sha256(code.encode()).hexdigest()
    if digest in config.backup_codes_hash:
        config.backup_codes_hash = [h for h in config.backup_codes_hash if h != digest]
        config.save(update_fields=["backup_codes_hash"])
        return True
    return False
