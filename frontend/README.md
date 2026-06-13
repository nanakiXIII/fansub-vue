# FansubZen — Vue 3 + Tailwind CSS

Site de fansub style Crunchyroll, construit avec **Vue 3**, **Vue Router** et **Tailwind CSS**.

## Stack

| Outil | Rôle |
|---|---|
| Vue 3 (Composition API) | Framework réactif |
| Vue Router 4 | Navigation SPA |
| Tailwind CSS 3 | Styles utilitaires |
| Vite 5 | Dev server & build |

## Installation & lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Build production
npm run build
```

## Structure du projet

```
src/
├── main.js              # Entrée + router
├── App.vue              # Layout global (navbar + footer)
├── style.css            # Tailwind + composants réutilisables
│
├── views/
│   ├── CataloguePage.vue    # Listing avec filtres, grille/liste
│   └── DetailPage.vue       # Fiche série complète
│
├── components/
│   └── AnimeCard.vue        # Carte anime réutilisable
│
└── data/
    └── series.js            # Mock data — à remplacer par ton API
```

## Routes

| URL | Page |
|---|---|
| `/catalogue` | Liste de toutes les séries |
| `/serie/:id` | Détail d'une série |

## Personnalisation

### Couleurs
Toutes les couleurs sont dans `tailwind.config.js` → `theme.extend.colors` :
```js
bg: { 0: '#0f0f13', 1: '#1a1a23', ... }
orange: { DEFAULT: '#f47521', hover: '#e06810' }
```

### Données
Remplace `/src/data/series.js` par un appel `fetch` ou une lib comme **axios** :
```js
// Exemple avec fetch
const { data } = await fetch('/api/series').then(r => r.json())
```

### Composants globaux
Les classes réutilisables (`.badge`, `.btn-primary`, `.anime-card`…) sont
dans `src/style.css` sous `@layer components`.
