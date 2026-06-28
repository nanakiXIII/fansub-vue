<div align="center">

# FansubZen

**Plateforme de fansub communautaire** — catalogue de séries animées avec sous-titres français, espace d'équipe et administration complète.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)

</div>

---

## Fonctionnalités

| Côté public | Côté administration |
|---|---|
| Catalogue filtrable (genre, statut, recherche) | Gestion des séries, épisodes, saisons |
| Player avec sélection saison / épisode | Rédaction d'actualités (éditeur riche) |
| Sous-titres intégrés | Modération des commentaires |
| Actualités & commentaires paginés | Gestion des utilisateurs et grades |
| Suivi de séries + notifications d'épisodes | Analytics & statistiques de lecture |
| Profil avec succès débloqués automatiquement | Logs d'audit des actions admin |
| Chat global en temps réel | Alertes globales et mode bêta |
| OAuth Google & Discord | Avancement de traduction (en cours) |
| Mode bêta avec rapports de bugs | API Tester intégré |

---

## Stack technique

```
frontend/   Vue 3 · Vite · Tailwind CSS · Socket.IO client
backend/    Express · Mongoose · Socket.IO · Passport (OAuth) · JWT
```

- **Auth** : JWT access token (15 min) + refresh token (7 j), OAuth Google & Discord
- **Temps réel** : Socket.IO — chat, notifications, présence, alertes
- **Permissions** : système de grades avec permissions granulaires (`series.create`, `comments.moderate`, etc.)
- **Audit** : chaque action admin est tracée (qui, quoi, quand, depuis quelle IP)

---

## Démarrage rapide (développement)

### Prérequis

| Outil | Version |
|---|---|
| Node.js | 18 LTS ou supérieur |
| npm | 9+ |
| MongoDB | 6+ (local ou Atlas) |
| ffmpeg | optionnel — extraction de sous-titres |

### Installation

```bash
git clone https://github.com/votre-utilisateur/fansub-vue.git
cd fansub-vue
```

**Backend**

```bash
cd backend
cp .env.example .env        # puis remplir les valeurs
npm install
npm run dev                 # démarre sur http://localhost:3000
```

**Frontend**

```bash
cd ../frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev                 # démarre sur http://localhost:5173
```

### Variables obligatoires

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/fansub
JWT_SECRET=<générez avec : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<autre valeur aléatoire>
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SITE_NAME=FansubZen
```

Voir les fichiers `.env.example` de chaque sous-dossier pour la liste complète des variables.

---

## Déploiement avec Docker

> Lance toute la stack (frontend + API + MongoDB) en une seule commande, sans rien installer localement.

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24 (inclut Docker Compose)

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/fansub-vue.git
cd fansub-vue
```

### 2. Configurer l'environnement

```bash
cp backend/.env.example backend/.env
```

Ouvrez `backend/.env` et renseignez au minimum ces deux secrets :

```env
JWT_SECRET=<valeur aléatoire longue>
JWT_REFRESH_SECRET=<autre valeur aléatoire>
```

> **Générer des secrets sécurisés :**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> # ou
> openssl rand -hex 64
> ```
>
> Les autres variables (`MONGODB_URI`, `CORS_ORIGIN`, etc.) sont déjà pré-remplies dans le `docker-compose.yml` pour un environnement local.

### 3. Construire et démarrer

```bash
docker compose up -d --build
```

C'est tout. L'application est disponible sur **[http://localhost](http://localhost)**.

```
✔  fansub_mongo     Up (healthy)
✔  fansub_backend   Up
✔  fansub_frontend  Up   0.0.0.0:80->80/tcp
```

| URL | Service |
|---|---|
| `http://localhost` | Interface Vue 3 |
| `http://localhost/api` | API REST |
| `http://localhost/socket.io` | WebSocket Socket.IO |

### 4. Commandes utiles

```bash
# Voir les logs en direct
docker compose logs -f

# Logs d'un service en particulier
docker compose logs -f backend

# Arrêter (sans perdre les données)
docker compose stop

# Arrêter et supprimer les conteneurs
docker compose down

# Tout supprimer, base de données incluse ⚠️
docker compose down -v

# Reconstruire après une modification du code
docker compose up -d --build backend
docker compose up -d --build frontend

# Shell dans le backend
docker compose exec backend sh

# Console MongoDB
docker compose exec mongo mongosh fansub
```

### Architecture Docker

```
        ┌─────────────────────────────────┐
        │     nginx (port 80)             │
        │   frontend/nginx.conf           │
        │                                 │
        │  /          → dist/index.html   │
        │  /api/      → backend:3000      │
        │  /socket.io → backend:3000 (WS) │
        └────────────┬────────────────────┘
                     │ réseau interne fansub_net
             ┌───────┴──────┐
             │              │
     ┌───────▼───────┐  ┌───▼──────────────┐
     │   backend     │  │   mongo:27017     │
     │   (Express)   │──│   (non exposé)    │
     └───────────────┘  └──────────────────┘
```

---

## Déploiement en production

### 1. Build du frontend

```bash
cd frontend
npm run build
# Fichiers statiques générés dans frontend/dist/
```

### 2. Lancer le backend avec PM2

```bash
cd backend
npm install --omit=dev
pm2 start src/server.js --name fansub-api
pm2 save && pm2 startup
```

### 3. Nginx — reverse proxy

```nginx
# Bots de prévisualisation de liens (Discord, Twitter/X, Facebook, Slack...) — ils ne
# rendent pas le JS donc ne voient jamais les balises Open Graph posées dynamiquement
# par useSeo.js côté client. On les renvoie vers le backend qui leur sert du HTML avec
# les bonnes meta déjà remplies pour la page demandée (cf. backend/src/routes/preview.js).
map $http_user_agent $is_preview_bot {
    default 0;
    ~*discordbot         1;
    ~*twitterbot         1;
    ~*facebookexternalhit 1;
    ~*facebot            1;
    ~*slackbot           1;
    ~*telegrambot        1;
    ~*whatsapp           1;
    ~*linkedinbot        1;
    ~*pinterest          1;
    ~*redditbot          1;
    ~*skypeuripreview    1;
    ~*vkshare            1;
    ~*tumblr             1;
    ~*viber              1;
    ~*embedly            1;
    ~*w3c_validator      1;
    ~*flipboard          1;
    ~*line/              1;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.fr;

    root /var/www/fansub/frontend/dist;
    index index.html;

    # SPA — Vue Router
    location / {
        if ($is_preview_bot) {
            rewrite ^(.*)$ /_preview$1 break;
            proxy_pass http://127.0.0.1:3000;
        }
        try_files $uri $uri/ /index.html;
    }

    # API REST
    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Socket.IO (WebSocket)
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host       $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Avatars uploadés
    location /uploads/ {
        alias /var/www/fansub/backend/uploads/;
        expires 7d;
    }
}
```

HTTPS avec Let's Encrypt :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.fr
```

### 4. Mise à jour

```bash
git pull
cd backend  && npm install --omit=dev && pm2 reload fansub-api
cd frontend && npm install && npm run build
```

---

## Structure du projet

```
fansub-vue/
├── backend/
│   ├── src/
│   │   ├── models/       # Schémas Mongoose (User, Series, Comment, AuditLog…)
│   │   ├── routes/       # Routes API REST (24 fichiers)
│   │   ├── middleware/   # requireAuth, requireAdmin, requirePermission, optionalAuth
│   │   ├── services/     # audit.js, achievements.js
│   │   └── socket.js     # Chat, notifications, présence temps réel
│   ├── uploads/          # Avatars & images uploadés
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Composants (AppNavbar, ChatWidget, CommentSection…)
│   │   ├── views/
│   │   │   └── admin/    # 15+ pages d'administration
│   │   ├── composables/  # useAuth, useSettings, useChat, useToast, useSocket
│   │   └── services/     # http.js (JWT + refresh auto), series.js, news.js…
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Variables d'environnement — référence complète

### Backend (`backend/.env`)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `PORT` | Non | `3000` | Port d'écoute Express |
| `MONGODB_URI` | **Oui** | — | URI MongoDB |
| `JWT_SECRET` | **Oui** | — | Secret access token (15 min) |
| `JWT_EXPIRES_IN` | Non | `15m` | Durée de vie access token |
| `JWT_REFRESH_SECRET` | **Oui** | — | Secret refresh token (7 j) |
| `CORS_ORIGIN` | **Oui** | — | URL du frontend (CORS) |
| `FRONTEND_URL` | **Oui** | — | URL frontend (redirections OAuth) |
| `OAUTH_CALLBACK_BASE` | Non | `FRONTEND_URL` | Base URL callbacks OAuth |
| `GOOGLE_CLIENT_ID` | Non | — | OAuth Google (vide = désactivé) |
| `GOOGLE_CLIENT_SECRET` | Non | — | Secret OAuth Google |
| `DISCORD_CLIENT_ID` | Non | — | OAuth Discord (vide = désactivé) |
| `DISCORD_CLIENT_SECRET` | Non | — | Secret OAuth Discord |
| `MEDIA_ROOT` | Non | — | Chemin absolu des fichiers vidéo |
| `FFMPEG_PATH` | Non | `ffmpeg` | Chemin vers ffmpeg |

### Frontend (`frontend/.env`)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Oui** | — | URL de l'API (`https://domaine.fr/api`) |
| `VITE_MEDIA_BASE_URL` | Non | `VITE_API_BASE_URL` | URL des médias |
| `VITE_SITE_NAME` | Non | `FansubZen` | Nom du site |
| `VITE_SITE_TAGLINE` | Non | — | Slogan page d'accueil |
| `VITE_SITE_YEAR` | Non | `2026` | Année footer |
| `VITE_TMDB_API_KEY` | Non | — | Clé TMDB (métadonnées anime) |
| `VITE_DISCORD_URL` | Non | — | Lien Discord (footer) |
| `VITE_TWITTER_URL` | Non | — | Lien Twitter/X (footer) |
| `VITE_GITHUB_URL` | Non | — | Lien GitHub (footer) |

---

## Contribuer

Les contributions sont les bienvenues. Pour proposer une modification :

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m "feat: description courte"`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

Pour signaler un bug, utilisez les [Issues GitHub](../../issues) en précisant les étapes pour reproduire le problème, votre environnement (OS, Node.js, navigateur) et le message d'erreur éventuel.

---

## Licence

Ce projet est sous licence [MIT](LICENSE).
