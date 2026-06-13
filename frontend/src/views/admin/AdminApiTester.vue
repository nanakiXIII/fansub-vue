<template>
  <div class="flex gap-3" style="height: calc(100vh - 7.5rem)">

    <!-- ─── Panneau gauche : liste des routes ─────────────────────── -->
    <div class="w-52 shrink-0 flex flex-col gap-2 min-h-0">
      <input
        v-model="search"
        type="text"
        placeholder="Chercher une route…"
        class="shrink-0 bg-bg-1 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-ink-1 placeholder:text-ink-3 outline-none focus:border-orange/40"
      />
      <div class="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0 pr-0.5">
        <div v-for="group in visibleGroups" :key="group.group">
          <div class="text-[9px] font-bold text-ink-3 uppercase tracking-widest mb-1 px-1">{{ group.group }}</div>
          <div class="flex flex-col gap-px">
            <button
              v-for="item in group.items"
              :key="item.method + item.path"
              @click="select(item)"
              class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-left hover:bg-white/[0.05] transition-colors"
              :class="active === item ? 'bg-white/[0.08]' : ''"
            >
              <span
                class="text-[8.5px] font-bold px-1.5 py-px rounded w-[38px] text-center shrink-0 leading-tight"
                :class="methodClass(item.method)"
              >{{ item.method }}</span>
              <span class="text-[11px] text-ink-2 truncate leading-snug">{{ item.label }}</span>
            </button>
          </div>
        </div>
        <div v-if="!visibleGroups.length" class="text-[11px] text-ink-3 text-center py-6">Aucune route trouvée</div>
      </div>
    </div>

    <!-- ─── Panneau droit : requête + réponse ────────────────────── -->
    <div class="flex-1 flex flex-col gap-2.5 min-h-0 min-w-0">

      <!-- Barre URL -->
      <div class="flex items-center gap-2 bg-bg-1 border border-white/[0.08] rounded-xl px-3 py-2 shrink-0">
        <span
          class="text-[9.5px] font-bold px-2 py-1 rounded-md w-14 text-center shrink-0 leading-tight"
          :class="active ? methodClass(active.method) : 'bg-white/[0.08] text-ink-3'"
        >{{ active?.method ?? 'GET' }}</span>
        <span class="text-[10px] text-ink-3 font-mono shrink-0 hidden xl:block">{{ apiBase }}</span>
        <input
          v-model="urlPath"
          type="text"
          spellcheck="false"
          class="flex-1 min-w-0 bg-transparent text-[12px] text-ink-1 outline-none font-mono placeholder:text-ink-3"
          placeholder="/series/:id"
          @keyup.enter="send"
        />
        <span v-if="active?.description" class="text-[10px] text-ink-3/70 italic hidden xl:block shrink-0 max-w-[180px] truncate">{{ active.description }}</span>
        <button
          @click="send"
          :disabled="loading || !urlPath"
          class="shrink-0 bg-orange hover:bg-orange/90 disabled:opacity-40 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors"
        >
          <span v-if="!loading" class="flex items-center gap-1">Envoyer <span class="opacity-70">▶</span></span>
          <span v-else class="flex items-center gap-1.5">
            <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Envoi…
          </span>
        </button>
      </div>

      <!-- Onglets -->
      <div class="flex items-center border-b border-white/[0.07] shrink-0">
        <button
          v-for="tab in TABS"
          :key="tab"
          @click="activeTab = tab"
          class="px-3 py-1.5 text-[11px] font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === tab ? 'border-orange text-white' : 'border-transparent text-ink-3 hover:text-ink-1'"
        >{{ tab }}</button>
      </div>

      <!-- Contenu onglet Corps -->
      <div v-if="activeTab === 'Corps'" class="shrink-0 flex flex-col gap-1.5" style="height: 160px">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-ink-3">JSON · application/json</span>
          <button @click="formatBody" class="text-[10px] text-ink-3 hover:text-orange transition-colors">Formater ↺</button>
        </div>
        <textarea
          v-model="body"
          spellcheck="false"
          class="flex-1 min-h-0 font-mono text-[11px] bg-bg-1 border border-white/[0.08] rounded-xl p-3 text-ink-1 outline-none focus:border-orange/30 resize-none leading-relaxed"
          :placeholder="bodyPlaceholder"
          :disabled="!hasBody"
          :class="!hasBody ? 'opacity-40 cursor-not-allowed' : ''"
        ></textarea>
      </div>

      <!-- Contenu onglet En-têtes -->
      <div v-else-if="activeTab === 'En-têtes'" class="shrink-0 bg-bg-1 border border-white/[0.08] rounded-xl p-3" style="max-height: 160px; overflow-y: auto">
        <div
          v-for="(v, k) in requestHeaders"
          :key="k"
          class="flex items-start gap-3 py-1 border-b border-white/[0.04] last:border-0"
        >
          <span class="text-[10px] font-mono text-orange/80 shrink-0 w-36">{{ k }}</span>
          <span class="text-[10px] font-mono text-ink-1 break-all">{{ k === 'Authorization' ? v.slice(0, 40) + (v.length > 40 ? '…' : '') : v }}</span>
        </div>
      </div>

      <!-- Contenu onglet Paramètres -->
      <div v-else-if="activeTab === 'Paramètres'" class="shrink-0 flex flex-col gap-2" style="max-height: 160px; overflow-y: auto">
        <div class="text-[10px] text-ink-3">Paramètres de requête — ajoutés automatiquement à l'URL</div>
        <div v-for="(p, i) in queryParams" :key="i" class="flex items-center gap-2">
          <input
            v-model="p.key"
            placeholder="clé"
            class="flex-1 bg-bg-1 border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] font-mono text-ink-1 outline-none focus:border-orange/30 placeholder:text-ink-3"
          />
          <span class="text-ink-3 text-[11px]">=</span>
          <input
            v-model="p.value"
            placeholder="valeur"
            class="flex-1 bg-bg-1 border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] font-mono text-ink-1 outline-none focus:border-orange/30 placeholder:text-ink-3"
          />
          <button @click="queryParams.splice(i, 1)" class="text-ink-3 hover:text-red-400 transition-colors text-[16px] leading-none px-0.5">×</button>
        </div>
        <button @click="queryParams.push({ key: '', value: '' })" class="text-[11px] text-ink-3 hover:text-orange transition-colors text-left">+ Ajouter</button>
      </div>

      <!-- Zone réponse -->
      <div class="flex-1 flex flex-col gap-2 min-h-0">

        <!-- Barre de statut réponse -->
        <div v-if="response !== null" class="flex items-center gap-3 shrink-0">
          <span
            class="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            :class="statusClass(response.status)"
          >{{ response.status }} {{ response.statusText }}</span>
          <span class="text-[11px] text-ink-3">{{ response.time }} ms</span>
          <span v-if="response.size" class="text-[11px] text-ink-3">{{ response.size }}</span>
          <div class="ml-auto flex items-center gap-2">
            <button @click="copyResponse" class="text-[10px] text-ink-3 hover:text-orange transition-colors">
              {{ copied ? 'Copié ✓' : 'Copier' }}
            </button>
            <button @click="response = null" class="text-[10px] text-ink-3 hover:text-red-400 transition-colors">Effacer</button>
          </div>
        </div>

        <!-- Corps de la réponse -->
        <pre
          v-if="response !== null"
          class="flex-1 min-h-0 overflow-auto bg-bg-1 border border-white/[0.08] rounded-xl p-3 text-[11px] font-mono whitespace-pre-wrap break-all leading-relaxed"
          :class="response.ok ? 'text-ink-1' : 'text-red-300'"
        >{{ response.body }}</pre>

        <!-- État vide -->
        <div v-else class="flex-1 flex flex-col items-center justify-center gap-2.5 text-center">
          <svg class="w-10 h-10 text-ink-3/25" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>
          </svg>
          <p class="text-[12px] text-ink-3">Sélectionnez une route et cliquez sur <span class="text-white font-semibold">Envoyer</span></p>
          <p class="text-[10px] text-ink-3/50">Le token JWT actuel est utilisé automatiquement</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const TABS = ['Corps', 'En-têtes', 'Paramètres']

const METHOD_COLORS = {
  GET:    'bg-green-500/15 text-green-400',
  POST:   'bg-blue-500/15 text-blue-400',
  PUT:    'bg-orange/15 text-orange',
  PATCH:  'bg-yellow-500/15 text-yellow-400',
  DELETE: 'bg-red-500/15 text-red-400',
}
function methodClass(m) { return METHOD_COLORS[m] ?? 'bg-white/[0.08] text-ink-2' }
function statusClass(s) {
  if (s >= 200 && s < 300) return 'bg-green-500/15 text-green-400'
  if (s >= 300 && s < 400) return 'bg-blue-500/15 text-blue-400'
  if (s >= 400 && s < 500) return 'bg-orange/15 text-orange'
  if (s >= 500)            return 'bg-red-500/15 text-red-400'
  return 'bg-white/[0.08] text-ink-3'
}

// ── Définition de toutes les routes backend ───────────────────────
const ROUTES = [
  {
    group: 'Authentification',
    items: [
      { method: 'GET',    path: '/auth/me',               label: 'Mon profil',              description: 'Profil de l\'utilisateur connecté' },
      { method: 'PATCH',  path: '/auth/me',               label: 'Modifier mon profil',     body: '{\n  "username": "nouveau_nom"\n}' },
      { method: 'DELETE', path: '/auth/me',               label: 'Supprimer mon compte',    description: 'Irréversible' },
      { method: 'POST',   path: '/auth/login',            label: 'Connexion',               body: '{\n  "email": "admin@example.com",\n  "password": "motdepasse"\n}',       description: 'Retourne token + refreshToken' },
      { method: 'POST',   path: '/auth/register',         label: 'Inscription',             body: '{\n  "username": "test",\n  "email": "test@example.com",\n  "password": "motdepasse123"\n}' },
      { method: 'POST',   path: '/auth/refresh',          label: 'Rafraîchir le token',     body: '{\n  "refreshToken": ""\n}',                                              description: 'Échange le refresh token' },
      { method: 'GET',    path: '/auth/providers',        label: 'Providers OAuth',         description: 'Google / Discord activés ?' },
      { method: 'GET',    path: '/auth/users',            label: 'Liste des utilisateurs',  description: 'Admin requis' },
      { method: 'PATCH',  path: '/auth/users/:id/admin', label: 'Basculer statut admin',   body: '{\n  "isAdmin": true\n}' },
      { method: 'PATCH',  path: '/auth/users/:id/role',  label: 'Assigner un grade',       body: '{\n  "roleId": ""\n}' },
      { method: 'DELETE', path: '/auth/users/:id',        label: 'Supprimer un utilisateur' },
    ],
  },
  {
    group: 'Séries',
    items: [
      { method: 'GET',    path: '/series',     label: 'Liste des séries',  description: '?status=&genre=&search=' },
      { method: 'GET',    path: '/series/:id', label: 'Détail d\'une série' },
      { method: 'POST',   path: '/series',     label: 'Créer une série',   body: '{\n  "id": "ma-serie",\n  "title": "Ma Série",\n  "status": "ongoing",\n  "genres": ["Action"],\n  "visible": false\n}' },
      { method: 'PUT',    path: '/series/:id', label: 'Modifier une série', body: '{\n  "title": "Nouveau titre",\n  "visible": true\n}' },
      { method: 'DELETE', path: '/series/:id', label: 'Supprimer une série' },
    ],
  },
  {
    group: 'Actualités',
    items: [
      { method: 'GET',    path: '/news',     label: 'Liste des actualités', description: '?page=&limit=&published=' },
      { method: 'GET',    path: '/news/:id', label: 'Détail d\'un article' },
      { method: 'POST',   path: '/news',     label: 'Créer un article',    body: '{\n  "title": "Titre",\n  "content": "<p>Contenu</p>",\n  "published": false\n}' },
      { method: 'PUT',    path: '/news/:id', label: 'Modifier un article', body: '{\n  "title": "Nouveau titre",\n  "published": true\n}' },
      { method: 'DELETE', path: '/news/:id', label: 'Supprimer un article' },
    ],
  },
  {
    group: 'Commentaires',
    items: [
      { method: 'GET',    path: '/comments',                label: 'Commentaires',         description: '?articleId=&serieId=&page=' },
      { method: 'POST',   path: '/comments',                label: 'Poster un commentaire', body: '{\n  "content": "Mon commentaire",\n  "articleId": ""\n}' },
      { method: 'PATCH',  path: '/comments/:id/approve',   label: 'Approuver' },
      { method: 'PATCH',  path: '/comments/:id/reject',    label: 'Rejeter' },
      { method: 'PATCH',  path: '/comments/:id/disapprove', label: 'Désapprouver' },
      { method: 'DELETE', path: '/comments/:id',            label: 'Supprimer' },
    ],
  },
  {
    group: 'Statistiques',
    items: [
      { method: 'GET',  path: '/stats',          label: 'Stats globales' },
      { method: 'GET',  path: '/stats/series',   label: 'Stats par série' },
      { method: 'GET',  path: '/stats/news',     label: 'Stats actualités' },
      { method: 'GET',  path: '/stats/comments', label: 'Stats commentaires' },
      { method: 'POST', path: '/stats/view',     label: 'Enregistrer une vue',            body: '{\n  "serieId": "ma-serie",\n  "seasonSlug": "saison-1",\n  "epNum": 1\n}' },
      { method: 'POST', path: '/stats/download', label: 'Enregistrer un téléchargement',  body: '{\n  "serieId": "ma-serie",\n  "seasonSlug": "saison-1",\n  "epNum": 1\n}' },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { method: 'GET',  path: '/analytics/summary',  label: 'Résumé analytics' },
      { method: 'POST', path: '/analytics/pageview', label: 'Enregistrer une page vue', body: '{\n  "path": "/",\n  "pageType": "home",\n  "sessionId": ""\n}' },
    ],
  },
  {
    group: 'Succès',
    items: [
      { method: 'GET',    path: '/achievements',        label: 'Succès publics' },
      { method: 'GET',    path: '/achievements/all',    label: 'Tous (admin)' },
      { method: 'GET',    path: '/achievements/my',     label: 'Mes succès débloqués' },
      { method: 'GET',    path: '/achievements/stats',  label: 'Mes statistiques' },
      { method: 'POST',   path: '/achievements/check',  label: 'Vérifier les succès' },
      { method: 'PATCH',  path: '/achievements/active', label: 'Définir le succès actif', body: '{\n  "achievementId": ""\n}' },
      { method: 'POST',   path: '/achievements',        label: 'Créer un succès',          body: '{\n  "key": "mon_succes",\n  "title": "Mon Succès",\n  "description": "Description",\n  "condition": "comment_count",\n  "threshold": 10\n}' },
      { method: 'PUT',    path: '/achievements/:id',    label: 'Modifier un succès',       body: '{\n  "title": "Nouveau titre"\n}' },
      { method: 'DELETE', path: '/achievements/:id',    label: 'Supprimer un succès' },
    ],
  },
  {
    group: 'Grades',
    items: [
      { method: 'GET',    path: '/roles',     label: 'Liste des grades' },
      { method: 'POST',   path: '/roles',     label: 'Créer un grade',   body: '{\n  "name": "Modérateur",\n  "color": "#3b82f6",\n  "permissions": ["comments.moderate"]\n}' },
      { method: 'PUT',    path: '/roles/:id', label: 'Modifier un grade', body: '{\n  "name": "Nouveau nom",\n  "permissions": ["comments.moderate", "news.create"]\n}' },
      { method: 'DELETE', path: '/roles/:id', label: 'Supprimer un grade' },
    ],
  },
  {
    group: 'Bêta / Bugs',
    items: [
      { method: 'GET',    path: '/bugs',           label: 'Tous les rapports (admin)', description: '?status=&priority=&page=' },
      { method: 'GET',    path: '/bugs/mine',       label: 'Mes rapports' },
      { method: 'POST',   path: '/bugs',            label: 'Soumettre un rapport',     body: '{\n  "title": "Titre du bug",\n  "description": "Description détaillée",\n  "type": "bug",\n  "priority": "medium"\n}' },
      { method: 'PATCH',  path: '/bugs/:id',        label: 'Mettre à jour un rapport', body: '{\n  "status": "resolved",\n  "priority": "high"\n}' },
      { method: 'PATCH',  path: '/bugs/:id/reply',  label: 'Répondre',                 body: '{\n  "reply": "Nous avons corrigé ce problème."\n}' },
      { method: 'DELETE', path: '/bugs/:id',        label: 'Supprimer un rapport' },
    ],
  },
  {
    group: 'Alertes',
    items: [
      { method: 'POST', path: '/alerts', label: 'Envoyer une alerte', body: '{\n  "type": "info",\n  "title": "Information",\n  "message": "Message de l\'alerte",\n  "targetType": "all"\n}' },
    ],
  },
  {
    group: 'Audit',
    items: [
      { method: 'GET', path: '/audit',         label: 'Logs d\'audit',    description: '?page=&action=&search=' },
      { method: 'GET', path: '/audit/actions', label: 'Types d\'actions' },
    ],
  },
  {
    group: 'Chat',
    items: [
      { method: 'GET', path: '/chat', label: 'Historique du chat', description: '60 derniers messages' },
    ],
  },
  {
    group: 'Notifications',
    items: [
      { method: 'GET',    path: '/notifications',          label: 'Mes notifications' },
      { method: 'PATCH',  path: '/notifications/read-all', label: 'Tout marquer comme lu' },
      { method: 'PATCH',  path: '/notifications/:id',      label: 'Marquer comme lu' },
      { method: 'DELETE', path: '/notifications/:id',      label: 'Supprimer une notification' },
    ],
  },
  {
    group: 'Sorties',
    items: [
      { method: 'GET',    path: '/releases',     label: 'Dernières sorties',  description: '?limit=20' },
      { method: 'POST',   path: '/releases',     label: 'Créer une sortie',   body: '{\n  "serieId": "ma-serie",\n  "seasonSlug": "saison-1",\n  "epNum": 1\n}' },
      { method: 'DELETE', path: '/releases/:id', label: 'Supprimer une sortie' },
    ],
  },
  {
    group: 'Avancement',
    items: [
      { method: 'GET',    path: '/inprogress',     label: 'Avancement en cours' },
      { method: 'POST',   path: '/inprogress',     label: 'Créer un avancement', body: '{\n  "serieId": "ma-serie",\n  "serieTitle": "Ma Série",\n  "episode": 5,\n  "status": "translating"\n}' },
      { method: 'PUT',    path: '/inprogress/:id', label: 'Modifier',            body: '{\n  "status": "encoding"\n}' },
      { method: 'DELETE', path: '/inprogress/:id', label: 'Supprimer' },
    ],
  },
  {
    group: 'Équipe',
    items: [
      { method: 'GET',    path: '/team',                   label: 'Membres de l\'équipe',     description: '?department=' },
      { method: 'GET',    path: '/team/available-users',   label: 'Utilisateurs disponibles' },
      { method: 'POST',   path: '/team',                   label: 'Ajouter un membre',        body: '{\n  "userId": "",\n  "department": "Traduction",\n  "role": "Traducteur"\n}' },
      { method: 'PUT',    path: '/team/:id',               label: 'Modifier un membre',       body: '{\n  "role": "Chef traducteur"\n}' },
      { method: 'DELETE', path: '/team/:id',               label: 'Supprimer un membre' },
    ],
  },
  {
    group: 'Recrutement',
    items: [
      { method: 'GET',    path: '/recruit',     label: 'Postes ouverts' },
      { method: 'POST',   path: '/recruit',     label: 'Créer un poste',   body: '{\n  "role": "Traducteur",\n  "department": "Traduction",\n  "description": "Description",\n  "open": true\n}' },
      { method: 'PUT',    path: '/recruit/:id', label: 'Modifier un poste', body: '{\n  "open": false\n}' },
      { method: 'DELETE', path: '/recruit/:id', label: 'Supprimer un poste' },
    ],
  },
  {
    group: 'Abonnements',
    items: [
      { method: 'GET',  path: '/follows',           label: 'Mes abonnements' },
      { method: 'POST', path: '/follows/:serieId',  label: 'Abonnement (toggle)' },
    ],
  },
  {
    group: 'Utilisateur',
    items: [
      { method: 'GET',    path: '/user/all',               label: 'Toutes mes données' },
      { method: 'GET',    path: '/user/favorites',          label: 'Mes favoris' },
      { method: 'POST',   path: '/user/favorites',          label: 'Ajouter un favori',            body: '{\n  "serieId": "ma-serie"\n}' },
      { method: 'DELETE', path: '/user/favorites/:serieId', label: 'Supprimer un favori' },
      { method: 'GET',    path: '/user/progress',           label: 'Ma progression' },
      { method: 'PUT',    path: '/user/progress',           label: 'Mettre à jour la progression', body: '{\n  "serieId": "ma-serie",\n  "seasonSlug": "saison-1",\n  "epNum": 3\n}' },
      { method: 'DELETE', path: '/user/progress/history',   label: 'Effacer l\'historique' },
      { method: 'GET',    path: '/user/downloads',          label: 'Mes téléchargements' },
      { method: 'POST',   path: '/user/downloads',          label: 'Enregistrer un téléchargement', body: '{\n  "serieId": "ma-serie",\n  "seasonSlug": "saison-1",\n  "epNum": 1\n}' },
      { method: 'DELETE', path: '/user/downloads',          label: 'Vider les téléchargements' },
    ],
  },
  {
    group: 'Paramètres',
    items: [
      { method: 'GET',   path: '/settings', label: 'Paramètres du site' },
      { method: 'PATCH', path: '/settings', label: 'Modifier les paramètres', body: '{\n  "betaMode": false,\n  "maintenanceMode": false\n}' },
    ],
  },
  {
    group: 'Accueil',
    items: [
      { method: 'GET', path: '/home', label: 'Données d\'accueil', description: 'Carousel, sorties, news, stats' },
    ],
  },
  {
    group: 'Fichiers',
    items: [
      { method: 'GET', path: '/files', label: 'Naviguer les fichiers', description: '?path= — MEDIA_ROOT requis' },
    ],
  },
]

// ── État ─────────────────────────────────────────────────────────
const search      = ref('')
const active      = ref(null)
const activeTab   = ref('Corps')
const urlPath     = ref('')
const body        = ref('')
const queryParams = ref([])
const loading     = ref(false)
const response    = ref(null)
const copied      = ref(false)

const hasBody = computed(() => ['POST', 'PUT', 'PATCH'].includes(active.value?.method ?? ''))
const bodyPlaceholder = computed(() =>
  hasBody.value
    ? '{\n  "key": "value"\n}'
    : `(aucun corps pour les requêtes ${active.value?.method ?? 'GET'})`
)

const requestHeaders = computed(() => {
  const h = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('fansub_jwt')
  if (token) h['Authorization'] = 'Bearer ' + token
  return h
})

const visibleGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return ROUTES
  return ROUTES.map(g => ({
    ...g,
    items: g.items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      i.path.toLowerCase().includes(q) ||
      i.method.toLowerCase().includes(q)
    ),
  })).filter(g => g.items.length)
})

// ── Actions ──────────────────────────────────────────────────────
function select(item) {
  active.value    = item
  urlPath.value   = item.path
  body.value      = item.body ?? ''
  queryParams.value = []
  response.value  = null
  activeTab.value = hasBody.value ? 'Corps' : 'En-têtes'
}

function formatBody() {
  try {
    body.value = JSON.stringify(JSON.parse(body.value), null, 2)
  } catch {}
}

async function send() {
  if (loading.value || !urlPath.value) return
  loading.value = true
  response.value = null

  const method = active.value?.method ?? 'GET'
  const headers = { ...requestHeaders.value }

  const qs = queryParams.value
    .filter(p => p.key.trim())
    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&')
  const sep = urlPath.value.includes('?') ? '&' : '?'
  const fullUrl = apiBase + urlPath.value + (qs ? sep + qs : '')

  const start = performance.now()
  try {
    const opts = { method, headers }
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.value.trim()) {
      opts.body = body.value
    }
    const res = await fetch(fullUrl, opts)
    const time = Math.round(performance.now() - start)
    const text = await res.text()
    let pretty = text
    try {
      pretty = JSON.stringify(JSON.parse(text), null, 2)
    } catch {}
    const bytes = new TextEncoder().encode(text).length
    const size  = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
    response.value = { status: res.status, statusText: res.statusText, ok: res.ok, time, size, body: pretty }
  } catch (err) {
    response.value = {
      status: 0, statusText: 'Erreur réseau', ok: false,
      time: Math.round(performance.now() - start), size: '',
      body: err.message,
    }
  }
  loading.value = false
}

async function copyResponse() {
  if (!response.value) return
  try {
    await navigator.clipboard.writeText(response.value.body)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
