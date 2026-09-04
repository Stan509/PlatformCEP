# CEP — Guide de déploiement DigitalOcean

> ⚠️ **Sécurité** : aucun secret ne doit être commité ni collé. Le jeton API DO
> est utilisé localement par `doctl` (jamais dans le dépôt). Toute clé/secrett
> vit dans un gestionnaire de secrets (DO + CI). **Révoquez tout jeton déjà
> partagé en clair.**

Ce guide part du principe que vous poussez le dépôt sur GitHub
(`Stan509/CEP`), puis provisionnez l'infra sur DigitalOcean.

---

## 0. Prérequis

- Un dépôt Git contenant ce monorepo (`cep-election-platform/`).
- `doctl` installé et authentifié : `doctl auth init` (utilise le jeton UNIQUEMENT en local).
- La chaîne de build fonctionne (voir la CI `.github/workflows/ci.yml`).

## 1. Base de données — PostgreSQL MANAGÉ (recommandé)

**Ne pas** utiliser un conteneur Postgres pour la production. Utilisez une
**Managed Database** DigitalOcean (disponibilité, PITR, sauvegardes, monitoring) :

```bash
doctl databases create cep-prod --engine postgres --version 16 --region nyc3 --size db-s-1vcpu-1gb
doctl databases list
doctl databases get <the-db-id>          # récupère l'hôte, le port, l'utilisateur
```

Récupérez la chaîne d'URI et créez les secrets d'app :

```bash
doctl databases connection-string <db-id>
doctl databases user create <db-id> cep_app
doctl databases user reset-password <db-id> cep_app
```

**Bonnes pratiques base** : TLS requis (sslmode), réseau privé (VPC) entre la
base et le droplet, sauvegardes quotidiennes activées, restriction IP.

## 2. Provisionnement d'un Droplet (docker-compose)

Le déploiement le plus simple : un Droplet avec Docker Compose + Caddy (TLS).

```bash
doctl compute droplet create cep-prod \
  --region nyc3 --size s-2vcpu-2gb --image ubuntu-22-04-x64 \
  --ssh-keys <your-ssh-key-id> --vpc-uuid <vpc-id>
doctl compute droplet list
```

Dans le droplet :

```bash
# Docker + compose
curl -fsSL https://get.docker.com | sh
apt-get update && apt-get install -y docker-compose-v2 git
git clone https://github.com/Stan509/CEP.git /opt/cep
cd /opt/cep

# Secrets (jamais dans Git)
cp infrastructure/docker/env.secrets.example infrastructure/.env
nano infrastructure/.env   # renseigner POSTGRES_*, DJANGO_SECRET_KEY, ...
```

## 3. Lancer les services

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
```

Souvenez-vous : si vous utilisez un Postgres **managé**, pointez `POSTGRES_HOST`
vers l'hôte managé et commentez le service `postgres` du compose.

## 4. TLS & reverse-proxy (Caddy)

Caddy délivre automatiquement les certificats Let's Encrypt :

```bash
docker run -d --name caddy \
  -p 80:80 -p 443:443 \
  -e SITE_ADDRESS=elections.example.ht \
  -e API_UPSTREAM=api:8000 \
  -v /opt/cep/infrastructure/caddy/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data -v caddy_config:/config \
  --network <le-reseau-du-compose> \
  caddy:2-alpine
```

> Les frontends statiques (PWA publique, admin) se servent soit via une Static
> Site DO (App Platform / Spaces), soit montés dans Caddy (`file_server`).

## 5. DNS

- Créez un A record `elections.example.ht` → IP publique du droplet.
- (Si App Platform) CNAME vers le domaine DO.

## 6. CI / déploiement (GitHub Actions)

Le dépôt contient `.github/workflows/ci.yml` : à chaque push sur `main`, il
valide TypeScript, Rust, Django (avec Postgres de service) et Go. Ajoutez les
**secrets GitHub** (`DIGITALOCEAN_ACCESS_TOKEN`, `GHCR_PAT`) et un job de
déploiement (SSH vers le droplet ou `doctl compute`).

## 7. Checklist de sécurité avant production

- [ ] TLS/HTTPS partout (Caddy), HSTS préchargé.
- [ ] Postgres **managé** + TLS + sauvegardes + VPC privé.
- [ ] `DJANGO_SECRET_KEY` fort (64+ chars), secrets en vault, jamais commités.
- [ ] `DJANGO_DEBUG=False`, `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS`/`CORS` restreints.
- [ ] JWT : sessions courtes, rotation refresh, MFA obligatoire pour les comptes privilégiés.
- [ ] APK signés (Ed25519) ; `DEVICE_PUBLIC_KEYS` alimenté par la PKI.
- [ ] Journal d'audit immuable : stockage séparé, sauvegardes immuables.
- [ ] Rate limiting, WAF, sauvegardes testées (restauration).
- [ ] Revue de sécurité indépendante, SAST/DAST/pentest, tests offline/replay.
- [ ] Validation institutionnelle & juridique des règles électorales.

---

> ⚠️ **Rappel** : ce dépôt est une génération d'architecture. Un déploiement
> réel « ultra-sécurisé » d'un système électoral exige une revue de sécurité
> indépendante et une validation par les autorités compétentes.
