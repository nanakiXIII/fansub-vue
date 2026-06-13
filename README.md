# FansubZen

Plateforme de fansub en français — diffusion de séries animées avec sous-titres communautaires.

**Stack :** Vue 3 · Express · MongoDB · Socket.IO · Tailwind CSS

---

## Sommaire

1. [Prérequis](#prérequis)
2. [Structure du projet](#structure-du-projet)
3. [Installation en développement](#installation-en-développement)
4. [Configuration](#configuration)
5. [Déploiement en production](#déploiement-en-production)
6. [Reverse proxy Nginx](#reverse-proxy-nginx)
7. [Gestion des processus avec PM2](#gestion-des-processus-avec-pm2)
8. [Variables d'environnement — référence complète](#variables-denvironnement--référence-complète)

---

## Prérequis

| Outil | Version minimale | Rôle |
|---|---|---|
| Node.js | 18 LTS | Backend + build frontend |
| npm | 9 | Gestionnaire de paquets |
| MongoDB | 6 | Base de données |
| ffmpeg | 4 | Extraction de sous-titres (optionnel) |
| Nginx | — | Reverse proxy (production) |
| PM2 | — | Gestionnaire de processus (production) |

---

## Structure du projet

```
fansub-vue/
├── backend/          # API Express + Socket.IO
│   ├── src/
│   │   ├── models/       # Schémas Mongoose
│   │   ├── routes/       # Routes API REST
│   │   ├── middleware/   # Auth, gestion d'erreurs
│   │   ├── services/     # Logique métier (audit, achievements…)
│   │   └── socket.js     # Handlers Socket.IO
│   ├── uploads/          # Avatars uploadés (généré au démarrage)
│   └── .env.example
├── frontend/         # App Vue 3 + Vite
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── views/        # Pages (+ sous-dossier admin/)
│   │   ├── composables/  # État réactif partagé
│   │   └── services/     # Appels API HTTP
│   ├── dist/             # Build de production (généré par vite build)
│   └── .env.example
└── README.md
```

---

## Installation en développement

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-org/fansub-vue.git
cd fansub-vue
```

### 2. Configurer le backend

```bash
cd backend
cp .env.example .env
# Éditez .env avec vos valeurs (voir section Configuration)
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### 3. Configurer le frontend

```bash
cd ../frontend
cp .env.example .env
# Éditez .env (VITE_API_BASE_URL=http://localhost:3000/api)
npm install
npm run dev
```

L'interface est accessible sur `http://localhost:5173`.

---

## Configuration

### Backend — `backend/.env`

Copiez `backend/.env.example` en `backend/.env` et renseignez chaque variable.  
Voir la [référence complète](#variables-denvironnement--référence-complète) ci-dessous.

Les variables **obligatoires** pour démarrer :

```env
MONGODB_URI=mongodb://localhost:27017/fansub
JWT_SECRET=<chaîne aléatoire longue>
JWT_REFRESH_SECRET=<autre chaîne aléatoire longue>
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Générez des secrets sécurisés :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend — `frontend/.env`

Copiez `frontend/.env.example` en `frontend/.env` :

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SITE_NAME=FansubZen
```

---

## Déploiement en production

### 1. Préparer le serveur

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y nodejs npm nginx

# MongoDB (si pas déjà installé)
# https://www.mongodb.com/docs/manual/installation/

# PM2 en global
npm install -g pm2
```

### 2. Déployer les fichiers

```bash
git clone https://github.com/votre-org/fansub-vue.git /var/www/fansub
cd /var/www/fansub
```

### 3. Installer les dépendances backend

```bash
cd backend
cp .env.example .env
nano .env   # remplir toutes les valeurs de production
npm install --omit=dev
```

### 4. Builder le frontend

```bash
cd ../frontend
cp .env.example .env
nano .env   # VITE_API_BASE_URL=https://votre-domaine.fr/api
npm install
npm run build
# Les fichiers statiques sont dans frontend/dist/
```

### 5. Créer le dossier des uploads

```bash
mkdir -p /var/www/fansub/backend/uploads/avatars
chown -R www-data:www-data /var/www/fansub/backend/uploads
```

---

## Reverse proxy Nginx

Créez `/etc/nginx/sites-available/fansub` :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr www.votre-domaine.fr;

    # Redirige vers HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.fr www.votre-domaine.fr;

    # Certificat SSL (Let's Encrypt recommandé)
    ssl_certificate     /etc/letsencrypt/live/votre-domaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.fr/privkey.pem;

    # Frontend (fichiers statiques Vue)
    root /var/www/fansub/frontend/dist;
    index index.html;

    # SPA — toutes les routes inconnues → index.html
    location / {
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
        proxy_set_header   X-Real-IP  $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads (avatars)
    location /uploads/ {
        alias /var/www/fansub/backend/uploads/;
        expires 7d;
        access_log off;
    }

    # Médias vidéo (optionnel — si MEDIA_ROOT est configuré)
    location /media/ {
        alias /chemin/vers/vos/videos/;
        expires 1d;
        access_log off;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/fansub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.fr -d www.votre-domaine.fr
```

---

## Gestion des processus avec PM2

### Démarrer le backend

```bash
cd /var/www/fansub/backend
pm2 start src/server.js --name fansub-api
pm2 save
pm2 startup   # génère la commande pour le démarrage automatique
```

### Commandes utiles

```bash
pm2 status              # état de tous les processus
pm2 logs fansub-api     # logs en temps réel
pm2 restart fansub-api  # redémarrer après un changement
pm2 reload fansub-api   # rechargement sans coupure (zero-downtime)
```

### Mise à jour du projet

```bash
cd /var/www/fansub
git pull

# Backend
cd backend && npm install --omit=dev
pm2 reload fansub-api

# Frontend
cd ../frontend
npm install
npm run build
# Nginx sert les nouveaux fichiers immédiatement depuis dist/
```

---

## Variables d'environnement — référence complète

### Backend (`backend/.env`)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `PORT` | Non | `3000` | Port d'écoute du serveur Express |
| `MONGODB_URI` | **Oui** | — | URI de connexion MongoDB |
| `JWT_SECRET` | **Oui** | — | Secret de signature des tokens d'accès |
| `JWT_EXPIRES_IN` | Non | `15m` | Durée de vie du token d'accès |
| `JWT_REFRESH_SECRET` | **Oui** | — | Secret de signature des refresh tokens (7 jours) |
| `CORS_ORIGIN` | **Oui** | — | URL du frontend autorisée par CORS |
| `FRONTEND_URL` | **Oui** | — | URL du frontend pour les redirections OAuth |
| `OAUTH_CALLBACK_BASE` | Non | valeur de `FRONTEND_URL` | Base URL pour les callbacks OAuth |
| `GOOGLE_CLIENT_ID` | Non | — | Client ID Google OAuth (laisser vide pour désactiver) |
| `GOOGLE_CLIENT_SECRET` | Non | — | Client Secret Google OAuth |
| `DISCORD_CLIENT_ID` | Non | — | Client ID Discord OAuth (laisser vide pour désactiver) |
| `DISCORD_CLIENT_SECRET` | Non | — | Client Secret Discord OAuth |
| `MEDIA_ROOT` | Non | — | Chemin absolu vers le dossier des fichiers vidéo |
| `FFMPEG_PATH` | Non | `ffmpeg` (PATH) | Chemin vers l'exécutable ffmpeg |

### Frontend (`frontend/.env`)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Oui** | — | URL de base de l'API (ex: `https://votre-domaine.fr/api`) |
| `VITE_MEDIA_BASE_URL` | Non | valeur de `VITE_API_BASE_URL` | URL de base pour les fichiers médias |
| `VITE_SITE_NAME` | Non | `FansubZen` | Nom du site (navbar, onglets) |
| `VITE_SITE_TAGLINE` | Non | — | Slogan affiché sur la page d'accueil |
| `VITE_SITE_YEAR` | Non | `2026` | Année dans le footer |
| `VITE_TMDB_API_KEY` | Non | — | Clé API TMDB pour la recherche de métadonnées anime |
| `VITE_DISCORD_URL` | Non | — | URL d'invitation Discord (footer) |
| `VITE_TWITTER_URL` | Non | — | URL Twitter/X (footer) |
| `VITE_GITHUB_URL` | Non | — | URL GitHub (footer) |

---

## Fonctionnalités principales

- **Catalogue** de séries avec filtres par genre, statut, recherche
- **Player** avec sélection de saison/épisode
- **Système de comptes** (inscription, connexion, OAuth Google/Discord)
- **Grades et permissions** granulaires pour les membres de l'équipe
- **Succès** débloqués automatiquement selon l'activité
- **Chat** global en temps réel (Socket.IO)
- **Notifications** à la sortie d'un épisode pour les séries suivies
- **Commentaires** paginés avec modération
- **Actualités** avec éditeur riche
- **Administration** complète : séries, news, utilisateurs, grades, analytics, audit…
- **Mode bêta** avec rapports de bugs et maintenance
