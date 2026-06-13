<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Séries</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ series.length }} série(s) dans le catalogue</p>
      </div>
      <button @click="openCreate" class="btn-primary text-[12px] py-2 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvelle série
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="activeFilter = f.value"
        class="px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
        :class="activeFilter === f.value
          ? 'bg-orange/10 text-orange border-orange/30'
          : 'bg-bg-1 text-ink-2 border-white/[0.06] hover:border-white/20'"
      >{{ f.label }}</button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="bg-bg-1 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <div class="w-8 h-11 rounded shrink-0 overflow-hidden">
          <img loading="lazy" v-if="s.poster" :src="s.poster" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full" :style="{ background: s.gradient || '#222' }"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-bold text-white truncate">{{ s.title }}</div>
          <div class="text-[10px] text-ink-3">{{ s.year }} · {{ episodeCount(s) }} ép.</div>
        </div>
        <span
          class="shrink-0 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 border"
          :class="{
            'bg-green-500/10 text-green-400 border-green-500/20':   s.status === 'completed',
            'bg-orange/10 text-orange border-orange/20':            s.status === 'ongoing',
            'bg-blue-500/10 text-blue-400 border-blue-500/20':      s.status === 'upcoming',
            'bg-purple-500/10 text-purple-400 border-purple-500/20': s.status === 'licensed',
            'bg-red-500/10 text-red-400 border-red-500/20':          s.status === 'dropped',
          }"
        >{{ statusLabel(s.status) }}</span>
        <button
          @click="toggleVisible(s)"
          class="shrink-0 flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors"
          :class="s.visible !== false
            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
            : 'bg-bg-2 text-ink-3 border-white/10 hover:border-white/20'"
        >
          <svg v-if="s.visible !== false" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          {{ s.visible !== false ? 'Visible' : 'Masqué' }}
        </button>
        <button @click="openEpModal(s)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Gérer les épisodes">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button @click="openEdit(s)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-orange hover:bg-orange/10 transition-colors" title="Modifier">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteSerie(s)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Supprimer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!filtered.length" class="text-[12px] text-ink-3 py-8 text-center">Aucune série.</div>
    </div>

    <!-- ── Modal création / édition ── -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="showModal = false">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col">

          <!-- En-tête modal -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
            <div class="text-[15px] font-extrabold text-white">
              {{ editingId ? 'Modifier la série' : 'Nouvelle série' }}
            </div>
            <button @click="showModal = false" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-6 py-5 flex flex-col gap-5 overflow-y-auto">

            <!-- ── Recherche TMDB — uniquement en mode création ── -->
            <div v-if="!editingId" class="bg-bg-2 border border-white/[0.08] rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span class="text-[12px] font-bold text-white">Importer depuis TMDB</span>
                <span class="text-[9px] text-ink-3 ml-auto">Données en français · clé gratuite requise</span>
              </div>

              <!-- Avertissement clé manquante -->
              <div v-if="!tmdbKey" class="mb-3 flex items-start gap-2.5 p-3 rounded-lg bg-orange/10 border border-orange/20">
                <svg class="w-4 h-4 text-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
                <div class="text-[11px] text-ink-2 leading-relaxed">
                  Clé TMDB non configurée. Crée un compte gratuit sur
                  <strong class="text-orange">themoviedb.org/settings/api</strong>,
                  copie ta clé API (v3) et ajoute-la dans <code class="text-ink-1 bg-bg-3 px-1 rounded">.env</code> :
                  <code class="block mt-1 text-green-400 bg-bg-3 px-2 py-1 rounded">VITE_TMDB_API_KEY=ta_clé_ici</code>
                  puis relance le serveur de développement.
                </div>
              </div>

              <div class="flex gap-2">
                <input
                  v-model="tmdbQuery"
                  class="admin-input flex-1"
                  :disabled="!tmdbKey"
                  placeholder="Rechercher un anime (titre français, anglais ou japonais)…"
                  @keydown.enter="searchTMDB"
                />
                <button
                  @click="searchTMDB"
                  :disabled="!tmdbKey || tmdbLoading"
                  class="btn-outline text-[12px] py-2 px-3 shrink-0 gap-1.5"
                >
                  <svg v-if="tmdbLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Chercher
                </button>
              </div>

              <!-- Résultats -->
              <div v-if="tmdbError" class="mt-2 text-[11px] text-red-400">{{ tmdbError }}</div>
              <div v-if="tmdbResults.length" class="mt-3 flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                <button
                  v-for="r in tmdbResults"
                  :key="r.id"
                  @click="applyTMDB(r)"
                  :disabled="tmdbFetching === r.id"
                  class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.06] transition-colors text-left w-full group disabled:opacity-60"
                >
                  <img loading="lazy"
                    v-if="r.poster_path"
                    :src="`${TMDB_IMG}w92${r.poster_path}`"
                    class="w-10 h-14 object-cover rounded shrink-0"
                  />
                  <div v-else class="w-10 h-14 rounded shrink-0 bg-bg-3 flex items-center justify-center text-ink-3 text-[9px]">N/A</div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[12px] font-bold text-white truncate group-hover:text-orange transition-colors">{{ r.name }}</div>
                    <div class="text-[10px] text-ink-3 truncate">{{ r.original_name }} · {{ r.first_air_date?.slice(0,4) ?? '?' }}</div>
                    <div class="text-[10px] text-ink-2">⭐ {{ r.vote_average?.toFixed(1) ?? '?' }}</div>
                  </div>
                  <svg v-if="tmdbFetching !== r.id" class="w-4 h-4 text-ink-3 group-hover:text-orange transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  <svg v-else class="w-4 h-4 text-orange animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                </button>
              </div>
              <div v-if="tmdbApplied" class="mt-2 flex items-center gap-1.5 text-[11px] text-green-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Formulaire pré-rempli en français depuis TMDB. Modifie si besoin.
              </div>
            </div>

            <!-- ── Formulaire ── -->
            <div class="flex flex-col gap-3">

              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Identifiant</div>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">Slug unique *</span>
                <input
                  v-model="form.id"
                  class="admin-input"
                  :class="editingId ? 'opacity-60 cursor-not-allowed' : ''"
                  :readonly="!!editingId"
                  placeholder="ex: jujutsu-kaisen-s3"
                />
                <span class="text-[10px] text-ink-3">
                  Utilisé dans l'URL : /serie/<strong class="text-ink-2">{{ form.id || '...' }}</strong>
                  <span v-if="editingId" class="text-ink-3"> · non modifiable</span>
                </span>
              </label>

              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mt-1">Titres</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Titre court *</span>
                  <input v-model="form.title" class="admin-input" placeholder="Jujutsu Kaisen S3" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Titre complet</span>
                  <input v-model="form.titleFull" class="admin-input" placeholder="Jujutsu Kaisen" />
                </label>
                <label class="flex flex-col gap-1 sm:col-span-2">
                  <span class="text-[10px] text-ink-3">Titre japonais</span>
                  <input v-model="form.titleJP" class="admin-input" placeholder="呪術廻戦" />
                </label>
              </div>

              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mt-1">Images</div>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">URL Poster</span>
                <div class="flex gap-2">
                  <input v-model="form.poster" class="admin-input flex-1" placeholder="https://…" />
                  <img loading="lazy" v-if="form.poster" :src="form.poster" class="w-10 h-14 object-cover rounded shrink-0 border border-white/10" />
                </div>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">URL Bannière</span>
                <input v-model="form.banner" class="admin-input" placeholder="https://…" />
              </label>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">Dégradé</span>
                <!-- Builder visuel -->
                <div class="flex items-center gap-3 p-3 bg-bg-3 rounded-lg border border-white/[0.06]">
                  <!-- Pipettes couleurs -->
                  <div class="flex items-center gap-1.5">
                    <div v-for="(color, i) in gradStops" :key="i" class="flex flex-col items-center gap-1">
                      <input
                        type="color"
                        :value="color"
                        @input="e => setGradStop(i, e.target.value)"
                        class="w-8 h-8 rounded-lg cursor-pointer border border-white/10 p-0.5 bg-transparent"
                        :title="`Couleur ${i + 1}`"
                      />
                      <span class="text-[8px] text-ink-3 font-mono">{{ color }}</span>
                    </div>
                  </div>
                  <!-- Angle -->
                  <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                      <input
                        type="number"
                        v-model.number="gradAngle"
                        @input="buildGradient"
                        min="0" max="360"
                        class="admin-input w-14 text-center px-1"
                      />
                      <span class="text-[10px] text-ink-3">°</span>
                    </div>
                    <span class="text-[8px] text-ink-3">angle</span>
                  </div>
                  <!-- Aperçu -->
                  <div class="flex-1 h-12 rounded-lg border border-white/10 min-w-0" :style="{ background: form.gradient || '#222' }"></div>
                </div>
                <!-- Champ CSS brut (avancé) -->
                <input
                  v-model="form.gradient"
                  class="admin-input font-mono text-[11px]"
                  placeholder="linear-gradient(155deg,#1a0d2e,#2a1050)"
                  @change="parseGradient"
                />
              </div>

              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mt-1">Informations</div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label class="flex flex-col gap-1" :class="form.status === 'licensed' ? '' : 'sm:col-span-1'">
                  <span class="text-[10px] text-ink-3">Statut</span>
                  <select v-model="form.status" class="admin-input">
                    <option value="ongoing">En cours</option>
                    <option value="completed">Terminée</option>
                    <option value="upcoming">À venir</option>
                    <option value="licensed">Licencié</option>
                    <option value="dropped">Abandonné</option>
                  </select>
                </label>
                <label v-if="form.status === 'licensed'" class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Licencié par</span>
                  <input v-model="form.licensedBy" class="admin-input" placeholder="Crunchyroll, ADN…" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Année</span>
                  <input v-model.number="form.year" type="number" class="admin-input" placeholder="2024" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Studio</span>
                  <input v-model="form.studio" class="admin-input" placeholder="MAPPA" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Score TMDB</span>
                  <input v-model.number="form.score" type="number" step="0.1" min="0" max="10" class="admin-input" placeholder="8.5" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Épisodes diffusés</span>
                  <input v-model.number="form.episodesAired" type="number" class="admin-input" placeholder="24" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Durée / épisode</span>
                  <input v-model="form.duration" class="admin-input" placeholder="~24 min" />
                </label>
              </div>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">Saison / arc (affiché sur la fiche)</span>
                <input v-model="form.season" class="admin-input" placeholder="Saison 3 · Arc Culling Game" />
              </label>

              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mt-1">Genres & Tags</div>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">Genres (séparés par des virgules)</span>
                <input v-model="form.genresStr" class="admin-input" placeholder="Action, Surnaturel, Shonen" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] text-ink-3">Tags</span>
                <input v-model="form.tagsStr" class="admin-input" placeholder="Simulcast, VOSTFR" />
              </label>

              <div class="mt-1">
                <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Synopsis</div>
              </div>
              <label class="flex flex-col gap-1">
                <textarea v-model="form.synopsis" class="admin-input resize-none h-24" placeholder="Synopsis de la série…"></textarea>
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer mt-1">
                <input type="checkbox" v-model="form.visible" class="w-4 h-4 accent-orange" />
                <span class="text-[12px] text-ink-1">Visible dans le catalogue</span>
              </label>
            </div>
          </div>

          <!-- Pied modal -->
          <div class="px-6 py-4 border-t border-white/[0.07] flex gap-2 shrink-0">
            <div v-if="formError" class="flex-1 text-[11px] text-red-400 flex items-center">{{ formError }}</div>
            <div class="flex gap-2 ml-auto">
              <button @click="showModal = false" class="btn-outline text-[12px] py-2 px-4">Annuler</button>
              <button @click="submitSave" :disabled="saving" class="btn-primary text-[12px] py-2 px-4">
                <span v-if="saving">{{ editingId ? 'Enregistrement…' : 'Création…' }}</span>
                <span v-else>{{ editingId ? 'Enregistrer' : 'Créer la série' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  <!-- ── Modal épisodes ── -->
  <Teleport to="body">
    <div v-if="showEpModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="showEpModal = false">
      <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <div class="text-[15px] font-extrabold text-white">{{ epSerie?.title }}</div>
            <div class="text-[11px] text-ink-3 mt-0.5">Saisons &amp; épisodes</div>
          </div>
          <button @click="showEpModal = false" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4">

          <!-- ── VUE SAISONS ── -->
          <template v-if="epView === 'seasons'">
            <div class="flex items-center justify-between mb-4">
              <span class="text-[11px] font-bold text-ink-3 uppercase tracking-widest">Saisons</span>
              <button @click="showSeasonForm = !showSeasonForm" class="btn-outline text-[11px] py-1.5 px-3 gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nouvelle saison
              </button>
            </div>

            <!-- Formulaire nouvelle saison -->
            <div v-if="showSeasonForm" class="mb-3 flex gap-2 p-3 bg-bg-2 rounded-xl border border-orange/20">
              <input v-model="seasonForm.label" class="admin-input flex-1" placeholder="Ex : Saison 1" @keydown.enter="addSeason" />
              <button @click="addSeason" class="btn-primary text-[12px] py-2 px-3 shrink-0">Ajouter</button>
              <button @click="showSeasonForm = false" class="btn-outline text-[12px] py-2 px-2 shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Saisons existantes -->
            <div class="flex flex-col gap-2 mb-3">
              <div
                v-for="(season, idx) in epSerie?.seasons"
                :key="idx"
                class="flex items-center gap-3 px-4 py-3 bg-bg-2 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition-colors group"
                @click="openSeasonEpisodes(idx)"
              >
                <svg class="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] font-bold text-white group-hover:text-orange transition-colors">{{ season.label }}</div>
                  <div class="text-[10px] text-ink-3">{{ season.episodes?.length ?? 0 }} épisode(s)</div>
                </div>
                <button @click.stop="deleteSeason(idx)" class="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100" title="Supprimer la saison">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
                <svg class="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>

            <!-- Épisodes sans saison -->
            <div
              class="flex items-center gap-3 px-4 py-3 bg-bg-2 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition-colors group"
              @click="openFlatEpisodes"
            >
              <svg class="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <div class="flex-1">
                <div class="text-[12px] font-bold text-white group-hover:text-orange transition-colors">Épisodes (liste plate)</div>
                <div class="text-[10px] text-ink-3">{{ epSerie?.episodes?.length ?? 0 }} épisode(s) sans saison</div>
              </div>
              <svg class="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </template>

          <!-- ── VUE ÉPISODES ── -->
          <template v-else>
            <button @click="backToSeasons" class="flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-orange transition-colors mb-4">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Retour aux saisons
            </button>

            <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <span class="text-[13px] font-bold text-white">{{ currentSeasonLabel }}</span>
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Import TMDB épisodes -->
                <template v-if="epSerie?.tmdbId">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] text-ink-3 shrink-0">Saison TMDB</span>
                    <input v-model.number="tmdbSeason" type="number" min="1" class="admin-input w-14 text-center text-[12px] py-1.5" />
                    <button @click="importFromTMDB" :disabled="tmdbImporting"
                      class="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50">
                      <svg v-if="!tmdbImporting" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      {{ tmdbImporting ? '…' : 'Noms TMDB' }}
                    </button>
                  </div>
                  <p v-if="tmdbImportErr" class="w-full text-[11px] text-red-400">{{ tmdbImportErr }}</p>
                </template>
                <button @click="openAddEpForm" class="btn-outline text-[11px] py-1.5 px-3 gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Ajouter un épisode
                </button>
              </div>
            </div>

            <!-- Formulaire épisode -->
            <div v-if="showEpForm" class="mb-4 p-4 bg-bg-2 rounded-xl border border-orange/20 flex flex-col gap-3">
              <div class="text-[11px] font-bold text-orange uppercase tracking-widest">
                {{ editingEpIdx >= 0 ? 'Modifier l\'épisode' : 'Nouvel épisode' }}
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">N° épisode *</span>
                  <input v-model.number="epForm.num" type="number" min="1" class="admin-input" placeholder="1" />
                </label>
                <label class="flex flex-col gap-1 sm:col-span-2">
                  <span class="text-[10px] text-ink-3">Titre</span>
                  <input v-model="epForm.title" class="admin-input" placeholder="Titre de l'épisode" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] text-ink-3">Date de diffusion</span>
                  <input v-model="epForm.airDate" type="date" class="admin-input" />
                </label>
                <label class="flex items-center gap-2 cursor-pointer col-span-2 sm:col-span-2 pt-4">
                  <input type="checkbox" v-model="epForm.visible" class="w-4 h-4 accent-orange" />
                  <span class="text-[12px] text-ink-1">Visible</span>
                </label>
              </div>
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Fichiers vidéo (optionnels)</div>
              <div class="flex flex-col gap-2">
                <div v-for="q in ['1080p','720p','480p']" :key="q" class="flex items-center gap-2">
                  <span class="text-[10px] text-ink-3 w-10 shrink-0">{{ q }}</span>
                  <input
                    :value="epForm['url' + q.replace('p','')]"
                    @input="e => epForm['url' + q.replace('p','')] = e.target.value"
                    class="admin-input flex-1 font-mono text-[11px]"
                    placeholder="Chemin ou URL…"
                  />
                  <button type="button" @click="openFilePicker(q)"
                    class="shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-2 rounded-lg border border-white/10 bg-bg-3 text-ink-2 hover:text-white hover:border-white/30 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    Parcourir
                  </button>
                </div>
              </div>
              <!-- Sous-titres -->
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Sous-titres</div>
              <div class="flex items-center gap-2">
                <input v-model="epForm.subUrl" class="admin-input flex-1 font-mono text-[11px]" placeholder="URL du fichier .vtt (auto-rempli après extraction)" readonly />
                <button type="button" @click="extractSubtitles" :disabled="epExtracting || !(epForm.url1080 || epForm.url720 || epForm.url480)"
                  class="shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-2 rounded-lg border transition-colors"
                  :class="epExtracting || !(epForm.url1080 || epForm.url720 || epForm.url480)
                    ? 'border-white/10 bg-bg-3 text-ink-3 cursor-not-allowed'
                    : 'border-orange/40 bg-orange/10 text-orange hover:bg-orange/20'">
                  <svg v-if="!epExtracting" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2v20M2 12l10 10 10-10"/></svg>
                  <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  {{ epExtracting ? 'Extraction…' : 'Extraire' }}
                </button>
                <button v-if="epForm.subUrl" type="button" @click="epForm.subUrl = ''" class="text-ink-3 hover:text-red-400 transition-colors text-[10px]" title="Supprimer">✕</button>
              </div>
              <p v-if="epExtractErr" class="text-[11px] text-red-400">{{ epExtractErr }}</p>

              <div class="flex gap-2 justify-end">
                <button @click="resetEpForm" class="btn-outline text-[12px] py-2 px-3">Annuler</button>
                <button @click="saveEp" class="btn-primary text-[12px] py-2 px-3">
                  {{ editingEpIdx >= 0 ? 'Enregistrer' : 'Ajouter' }}
                </button>
              </div>
            </div>

            <!-- Liste des épisodes -->
            <div v-if="currentEpisodes.length" class="flex flex-col gap-1.5">
              <div
                v-for="(ep, idx) in currentEpisodes"
                :key="ep.num"
                class="flex items-center gap-3 px-3 py-2.5 bg-bg-2 rounded-lg border border-white/[0.06] group"
              >
                <span class="text-[12px] font-extrabold text-orange shrink-0 w-8 text-center">{{ ep.num }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] text-white truncate">{{ ep.title || '(sans titre)' }}</div>
                  <div v-if="ep.airDate" class="text-[10px] text-ink-3">{{ ep.airDate }}</div>
                </div>
                <span v-if="ep.sources" class="text-[9px] text-green-400 bg-green-400/10 border border-green-400/20 rounded px-1.5 py-0.5 shrink-0">Liens</span>
                <span v-if="ep.visible === false" class="text-[9px] text-ink-3 bg-bg-3 border border-white/10 rounded px-1.5 py-0.5 shrink-0">Masqué</span>
                <button @click="startEditEp(ep, idx)" class="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-orange hover:bg-orange/10 transition-colors opacity-0 group-hover:opacity-100" title="Modifier">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button @click="deleteEp(idx)" class="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100" title="Supprimer">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-10 text-[12px] text-ink-3">
              Aucun épisode. Clique sur "Ajouter un épisode" pour commencer.
            </div>
          </template>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-white/[0.07] flex items-center gap-2 shrink-0">
          <div v-if="epError" class="flex-1 text-[11px] text-red-400">{{ epError }}</div>
          <div v-else-if="epSaving" class="flex-1 flex items-center gap-1.5 text-[11px] text-ink-3">
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            Sauvegarde…
          </div>
          <div v-else-if="epSaved" class="flex-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Sauvegardé
          </div>
          <div v-else class="flex-1 text-[11px] text-ink-3">Sauvegarde automatique</div>
          <button @click="showEpModal = false" class="btn-primary text-[12px] py-2 px-4">Fermer</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Navigateur de fichiers ── -->
  <Teleport to="body">
    <div v-if="fpOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="fpOpen = false">
      <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] shrink-0">
          <div class="text-[13px] font-bold text-white">Choisir un fichier — {{ fpQuality }}</div>
          <button @click="fpOpen = false" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Breadcrumb -->
        <div class="flex items-center gap-1 px-5 py-2 border-b border-white/[0.05] text-[11px] text-ink-3 overflow-x-auto shrink-0">
          <button @click="fpNavigate('')" class="hover:text-orange transition-colors shrink-0">Racine</button>
          <template v-for="(part, i) in fpBreadcrumb" :key="i">
            <span class="shrink-0">/</span>
            <button
              @click="fpNavigate(fpBreadcrumb.slice(0, i + 1).join('/'))"
              class="hover:text-orange transition-colors shrink-0"
              :class="i === fpBreadcrumb.length - 1 ? 'text-white font-semibold' : ''"
            >{{ part }}</button>
          </template>
        </div>

        <!-- Contenu -->
        <div class="flex-1 overflow-y-auto p-3">
          <div v-if="fpLoading" class="flex items-center justify-center py-10">
            <div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="fpError" class="text-[12px] text-red-400 text-center py-8">{{ fpError }}</div>
          <div v-else-if="!fpEntries.length" class="text-[12px] text-ink-3 text-center py-8">Dossier vide</div>
          <div v-else class="flex flex-col gap-1">
            <button
              v-for="entry in fpVisibleEntries"
              :key="entry.path"
              @click="entry.isDir ? fpNavigate(entry.path) : fpSelect(entry)"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors w-full"
              :class="entry.isDir ? 'hover:bg-white/[0.06] text-ink-1' : 'hover:bg-orange/10 hover:text-orange text-ink-2'"
            >
              <!-- Icône dossier -->
              <svg v-if="entry.isDir" class="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H2v16h20V6H12l-2-2z"/></svg>
              <!-- Icône fichier vidéo -->
              <svg v-else class="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <span class="text-[12px] truncate">{{ entry.name }}</span>
              <svg v-if="entry.isDir" class="w-3.5 h-3.5 text-ink-3 ml-auto shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-white/[0.07] shrink-0">
          <button @click="fpOpen = false" class="btn-outline text-[12px] py-2 px-4 w-full">Annuler</button>
        </div>
      </div>
    </div>
  </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/'
const tmdbKey   = import.meta.env.VITE_TMDB_API_KEY || ''

const series       = ref([])
const loading      = ref(true)
const activeFilter = ref('all')
const showModal    = ref(false)
const editingId    = ref(null)
const saving       = ref(false)
const formError    = ref('')

const tmdbQuery    = ref('')
const tmdbLoading  = ref(false)
const tmdbResults  = ref([])
const tmdbError    = ref('')
const tmdbApplied  = ref(false)
const tmdbFetching = ref(null)
const gradStops = ref(['#0d0d1a', '#1a1030', '#0a0816'])
const gradAngle = ref(155)

function setGradStop(i, val) {
  gradStops.value[i] = val
  buildGradient()
}

function buildGradient() {
  form.value.gradient = `linear-gradient(${gradAngle.value}deg,${gradStops.value.join(',')})`
}

function parseGradient() {
  const str = form.value.gradient || ''
  const angleMatch = str.match(/(\d+)deg/)
  if (angleMatch) gradAngle.value = parseInt(angleMatch[1])
  const colors = [...str.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => {
    const h = m[1]
    return h.length === 3
      ? '#' + h.split('').map(c => c + c).join('')
      : '#' + h
  })
  if (colors[0]) gradStops.value[0] = colors[0]
  if (colors[1]) gradStops.value[1] = colors[1]
  if (colors[2]) gradStops.value[2] = colors[2]
}

const filters = [
  { label: 'Toutes',    value: 'all'       },
  { label: 'En cours',  value: 'ongoing'   },
  { label: 'Terminées', value: 'completed' },
  { label: 'À venir',   value: 'upcoming'  },
  { label: 'Masquées',  value: 'hidden'    },
]

const emptyForm = () => ({
  id: '', title: '', titleFull: '', titleJP: '',
  poster: '', banner: '', gradient: '',
  status: 'ongoing', licensedBy: '', year: null, studio: '',
  score: null, episodesAired: null, duration: '', season: '',
  genresStr: '', tagsStr: '', synopsis: '',
  visible: true, tmdbId: null,
})

const form = ref(emptyForm())

const filtered = computed(() => {
  if (activeFilter.value === 'hidden')  return series.value.filter(s => s.visible === false)
  if (activeFilter.value === 'all')     return series.value
  return series.value.filter(s => s.status === activeFilter.value)
})

function statusLabel(s) {
  return { ongoing: 'En cours', completed: 'Terminée', upcoming: 'À venir', licensed: 'Licencié', dropped: 'Abandonné' }[s] ?? s
}

function tmdbStatus(s) {
  if (!s) return 'ongoing'
  if (s === 'Returning Series') return 'ongoing'
  if (s === 'Ended' || s === 'Canceled') return 'completed'
  return 'upcoming'
}

function episodeCount(s) {
  if (s.seasons?.length) return s.seasons.reduce((n, ss) => n + (ss.episodes?.length ?? 0), 0)
  return s.episodes?.length ?? 0
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

onMounted(async () => {
  try { series.value = await http.get('/series?managed=1') } catch {}
  loading.value = false
})

function resetModal() {
  formError.value      = ''
  tmdbQuery.value      = ''
  tmdbResults.value    = []
  tmdbError.value      = ''
  tmdbApplied.value    = false
}

function openCreate() {
  editingId.value    = null
  form.value         = emptyForm()
  gradStops.value    = ['#0d0d1a', '#1a1030', '#0a0816']
  gradAngle.value    = 155
  resetModal()
  showModal.value    = true
}

function openEdit(s) {
  editingId.value = s.id
  form.value = {
    id:            s.id,
    title:         s.title         ?? '',
    titleFull:     s.titleFull     ?? '',
    titleJP:       s.titleJP       ?? '',
    poster:        s.poster        ?? '',
    banner:        s.banner        ?? '',
    gradient:      s.gradient      ?? '',
    status:        s.status        ?? 'ongoing',
    licensedBy:    s.licensedBy    ?? '',
    year:          s.year          ?? null,
    studio:        s.studio        ?? '',
    score:         s.score         ?? null,
    episodesAired: s.episodesAired ?? null,
    duration:      s.duration      ?? '',
    season:        s.season        ?? '',
    genresStr:     (s.genres ?? []).join(', '),
    tagsStr:       (s.tags   ?? []).join(', '),
    synopsis:      s.synopsis      ?? '',
    visible:       s.visible !== false,
    tmdbId:        s.tmdbId        ?? null,
  }
  resetModal()
  parseGradient()
  showModal.value = true
}

async function searchTMDB() {
  const q = tmdbQuery.value.trim()
  if (!q || !tmdbKey) return
  tmdbLoading.value = true
  tmdbError.value   = ''
  tmdbResults.value = []
  try {
    const url  = `${TMDB_BASE}/search/tv?query=${encodeURIComponent(q)}&language=fr-FR&page=1&api_key=${tmdbKey}`
    const res  = await fetch(url)
    const data = await res.json()
    if (!res.ok) throw new Error(data.status_message || 'Erreur TMDB')
    tmdbResults.value = (data.results ?? []).slice(0, 8)
    if (!tmdbResults.value.length) tmdbError.value = 'Aucun résultat trouvé.'
  } catch (e) {
    tmdbError.value = `Erreur : ${e.message}`
  }
  tmdbLoading.value = false
}

async function applyTMDB(r) {
  if (!tmdbKey) return
  tmdbFetching.value = r.id
  try {
    const url  = `${TMDB_BASE}/tv/${r.id}?language=fr-FR&api_key=${tmdbKey}`
    const res  = await fetch(url)
    const d    = await res.json()
    if (!res.ok) throw new Error(d.status_message || 'Erreur TMDB')

    const studio   = d.networks?.[0]?.name || d.production_companies?.[0]?.name || ''
    const genres   = (d.genres ?? []).map(g => g.name).join(', ')
    const duration = d.episode_run_time?.[0] ? `~${d.episode_run_time[0]} min` : ''
    const year     = d.first_air_date ? parseInt(d.first_air_date.slice(0, 4)) : null
    const poster   = d.poster_path   ? `${TMDB_IMG}w500${d.poster_path}`       : ''
    const banner   = d.backdrop_path ? `${TMDB_IMG}original${d.backdrop_path}` : ''

    form.value = {
      id:            slugify(d.name || r.name),
      title:         d.name || r.name,
      titleFull:     d.name || r.name,
      titleJP:       d.original_language === 'ja' ? (d.original_name || '') : '',
      poster,
      banner,
      gradient:      'linear-gradient(155deg,#0d0d1a,#1a1030,#0a0816)',
      status:        tmdbStatus(d.status),
      year,
      studio,
      score:         d.vote_average ? Math.round(d.vote_average * 10) / 10 : null,
      episodesAired: d.number_of_episodes || null,
      duration,
      season:        'Saison 1',
      genresStr:     genres,
      tagsStr:       '',
      synopsis:      d.overview || '',
      visible:       false,
      tmdbId:        d.id ?? null,
    }
    tmdbApplied.value  = true
    tmdbResults.value  = []
    gradStops.value    = ['#0d0d1a', '#1a1030', '#0a0816']
    gradAngle.value    = 155
  } catch (e) {
    tmdbError.value = `Erreur : ${e.message}`
  }
  tmdbFetching.value = null
}

async function submitSave() {
  formError.value = ''
  if (!form.value.id.trim())    { formError.value = 'Le slug est requis.'; return }
  if (!form.value.title.trim()) { formError.value = 'Le titre est requis.'; return }

  const payload = {
    ...form.value,
    genres: form.value.genresStr.split(',').map(g => g.trim()).filter(Boolean),
    tags:   form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
  }
  delete payload.genresStr
  delete payload.tagsStr

  saving.value = true
  try {
    if (editingId.value) {
      // Modification
      const updated = await http.put(`/series/${editingId.value}`, payload)
      const idx = series.value.findIndex(x => x.id === editingId.value)
      if (idx !== -1) series.value[idx] = updated
    } else {
      // Création
      payload.id       = payload.id.trim()
      payload.seasons  = []
      payload.episodes = []
      const created = await http.post('/series', payload)
      series.value.unshift(created)
    }
    showModal.value = false
  } catch (e) {
    formError.value = e.message
  }
  saving.value = false
}

// ── Navigateur de fichiers ────────────────────────────────────────────

const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || ''

const fpOpen     = ref(false)
const fpQuality  = ref('')
const fpPath     = ref('')
const fpEntries  = ref([])
const fpLoading  = ref(false)
const fpError    = ref('')

const fpBreadcrumb = computed(() =>
  fpPath.value ? fpPath.value.split('/').filter(Boolean) : []
)

async function fpNavigate(relPath) {
  fpPath.value    = relPath
  fpLoading.value = true
  fpError.value   = ''
  fpEntries.value = []
  try {
    const data = await http.get(`/files?path=${encodeURIComponent(relPath)}`)
    fpEntries.value = data.entries ?? []
  } catch (e) {
    fpError.value = e.message
  }
  fpLoading.value = false
}

const usedFilePaths = computed(() => {
  const urls = new Set()
  const collect = (episodes) => {
    if (!episodes) return
    for (const ep of episodes) {
      // URLs stockées dans sources.{lang}.{qualité}
      if (ep.sources) {
        for (const lang of Object.values(ep.sources)) {
          if (lang && typeof lang === 'object') {
            for (const url of Object.values(lang)) {
              if (url) urls.add(url)
            }
          }
        }
      }
    }
  }
  if (epSerie.value?.seasons?.length) epSerie.value.seasons.forEach(s => collect(s.episodes))
  collect(epSerie.value?.episodes)
  // Inclure aussi l'épisode en cours d'édition (non encore sauvegardé)
  if (epForm.value.url480)  urls.add(epForm.value.url480)
  if (epForm.value.url720)  urls.add(epForm.value.url720)
  if (epForm.value.url1080) urls.add(epForm.value.url1080)
  return urls
})

function isFileUsed(entry) {
  if (entry.isDir) return false
  const url = MEDIA_BASE ? `${MEDIA_BASE}/${entry.path}` : entry.path
  return usedFilePaths.value.has(url)
}

const fpVisibleEntries = computed(() =>
  fpEntries.value.filter(e => e.isDir || !isFileUsed(e))
)

function openFilePicker(quality) {
  fpQuality.value = quality
  fpOpen.value    = true
  fpNavigate(fpPath.value || '')
}

function fpSelect(entry) {
  const url = MEDIA_BASE ? `${MEDIA_BASE}/${entry.path}` : entry.path
  epForm.value['url' + fpQuality.value.replace('p', '')] = url
  fpOpen.value = false
}

// ── Gestion épisodes ──────────────────────────────────────────────────

const showEpModal   = ref(false)
const epSerie       = ref(null)
const epView        = ref('seasons') // 'seasons' | 'episodes'
const epSeasonIdx   = ref(-1)        // -1 = liste plate, sinon index saison
const epSaving      = ref(false)
const epSaved       = ref(false)     // feedback auto-save
const epError       = ref('')
const showSeasonForm = ref(false)
const seasonForm    = ref({ label: '' })
const showEpForm    = ref(false)
const editingEpIdx  = ref(-1)
const epForm        = ref({ num: 1, title: '', airDate: '', thumbnail: '', visible: true, url1080: '', url720: '', url480: '', subUrl: '' })
const epExtracting  = ref(false)
const epExtractErr  = ref('')
const tmdbSeason    = ref(1)
const tmdbImporting = ref(false)
const tmdbImportErr = ref('')

const currentEpisodes = computed(() => {
  if (!epSerie.value) return []
  if (epSeasonIdx.value === -1) return epSerie.value.episodes ?? []
  return epSerie.value.seasons?.[epSeasonIdx.value]?.episodes ?? []
})

const currentSeasonLabel = computed(() => {
  if (epSeasonIdx.value === -1) return 'Épisodes (liste plate)'
  return epSerie.value?.seasons?.[epSeasonIdx.value]?.label ?? ''
})

function openEpModal(s) {
  epSerie.value = JSON.parse(JSON.stringify(s))
  if (!epSerie.value.seasons)  epSerie.value.seasons  = []
  if (!epSerie.value.episodes) epSerie.value.episodes = []
  epView.value        = 'seasons'
  epError.value       = ''
  showSeasonForm.value = false
  showEpForm.value    = false
  showEpModal.value   = true
}

function openSeasonEpisodes(idx) {
  epSeasonIdx.value = idx
  epView.value      = 'episodes'
  showEpForm.value  = false
  editingEpIdx.value = -1
}

function openFlatEpisodes() {
  epSeasonIdx.value  = -1
  epView.value       = 'episodes'
  showEpForm.value   = false
  editingEpIdx.value = -1
}

function backToSeasons() {
  epView.value      = 'seasons'
  showEpForm.value  = false
  editingEpIdx.value = -1
}

function addSeason() {
  const label = seasonForm.value.label.trim()
  if (!label) return
  epSerie.value.seasons.push({ slug: slugify(label), label, episodes: [], visible: true })
  seasonForm.value  = { label: '' }
  showSeasonForm.value = false
  saveEpisodes()
}

function deleteSeason(idx) {
  const s = epSerie.value.seasons[idx]
  if (!confirm(`Supprimer la saison "${s.label}" et ses ${s.episodes?.length ?? 0} épisode(s) ?`)) return
  epSerie.value.seasons.splice(idx, 1)
  saveEpisodes()
}

function openAddEpForm() {
  editingEpIdx.value = -1
  epForm.value = {
    num: (currentEpisodes.value.length + 1),
    title: '', airDate: new Date().toISOString().slice(0, 10), thumbnail: '', visible: true,
    url1080: '', url720: '', url480: '', subUrl: '',
  }
  epExtractErr.value = ''
  showEpForm.value = true
}

function startEditEp(ep, idx) {
  editingEpIdx.value = idx
  const fr = ep.sources?.fr ?? {}
  epForm.value = {
    num:     ep.num,
    title:   ep.title   || '',
    airDate:   ep.airDate   || '',
    thumbnail: ep.thumbnail || '',
    visible:   ep.visible !== false,
    url1080:   fr['1080p']  || '',
    url720:  fr['720p']  || '',
    url480:  fr['480p']  || '',
    subUrl:  ep.subUrl   || '',
  }
  epExtractErr.value = ''
  showEpForm.value = true
}

function resetEpForm() {
  showEpForm.value   = false
  editingEpIdx.value = -1
}

function buildSources() {
  const fr = {}
  if (epForm.value.url1080) fr['1080p'] = epForm.value.url1080
  if (epForm.value.url720)  fr['720p']  = epForm.value.url720
  if (epForm.value.url480)  fr['480p']  = epForm.value.url480
  return Object.keys(fr).length ? { fr } : null
}

function saveEp() {
  const num = parseInt(epForm.value.num)
  if (isNaN(num) || num < 1) return
  const ep = {
    num,
    title:     epForm.value.title.trim(),
    airDate:   epForm.value.airDate,
    thumbnail: epForm.value.thumbnail.trim(),
    visible:   epForm.value.visible,
    subUrl:    epForm.value.subUrl.trim(),
    sources: buildSources(),
  }
  const list = epSeasonIdx.value === -1
    ? epSerie.value.episodes
    : epSerie.value.seasons[epSeasonIdx.value].episodes
  if (editingEpIdx.value >= 0) {
    list.splice(editingEpIdx.value, 1, ep)
  } else {
    list.push(ep)
  }
  list.sort((a, b) => a.num - b.num)
  resetEpForm()
  saveEpisodes()
}

async function extractSubtitles() {
  const videoUrl = epForm.value.url1080 || epForm.value.url720 || epForm.value.url480
  if (!videoUrl) return
  const relPath = MEDIA_BASE ? videoUrl.replace(MEDIA_BASE.replace(/\/$/, '') + '/', '') : videoUrl
  epExtracting.value = true
  epExtractErr.value = ''
  try {
    const result = await http.post('/subtitles/extract', { filePath: relPath })
    epForm.value.subUrl = MEDIA_BASE ? `${MEDIA_BASE.replace(/\/$/, '')}/${result.vttPath}` : result.vttPath
  } catch (e) {
    epExtractErr.value = e?.data?.detail ? `${e.message} — ${e.data.detail}` : (e?.message || 'Extraction échouée')
  } finally {
    epExtracting.value = false
  }
}

async function importFromTMDB() {
  const tmdbId = epSerie.value?.tmdbId
  if (!tmdbId || !tmdbKey) return
  tmdbImporting.value = true
  tmdbImportErr.value = ''
  try {
    const url = `${TMDB_BASE}/tv/${tmdbId}/season/${tmdbSeason.value}?language=fr-FR&api_key=${tmdbKey}`
    const res = await fetch(url)
    const d   = await res.json()
    if (!res.ok) throw new Error(d.status_message || 'Erreur TMDB')

    const list = epSeasonIdx.value === -1
      ? epSerie.value.episodes
      : epSerie.value.seasons[epSeasonIdx.value].episodes

    for (const ep of d.episodes ?? []) {
      const existing = list.find(e => e.num === ep.episode_number)
      const thumb = ep.still_path ? `${TMDB_IMG}w300${ep.still_path}` : ''
      if (existing) {
        if (ep.name)     existing.title     = ep.name
        if (ep.air_date) existing.airDate   = ep.air_date
        if (thumb)       existing.thumbnail = thumb
      } else {
        list.push({ num: ep.episode_number, title: ep.name || '', airDate: ep.air_date || '', thumbnail: thumb, visible: true, subUrl: '', sources: null })
      }
    }
    list.sort((a, b) => a.num - b.num)
    saveEpisodes()
  } catch (e) {
    tmdbImportErr.value = e.message
  } finally {
    tmdbImporting.value = false
  }
}

function deleteEp(idx) {
  const list = epSeasonIdx.value === -1
    ? epSerie.value.episodes
    : epSerie.value.seasons[epSeasonIdx.value].episodes
  list.splice(idx, 1)
  saveEpisodes()
}

async function saveEpisodes() {
  epSaving.value = true
  epError.value  = ''
  epSaved.value  = false
  try {
    const updated = await http.put(`/series/${epSerie.value.id}`, {
      seasons:  epSerie.value.seasons,
      episodes: epSerie.value.episodes,
    })
    const idx = series.value.findIndex(x => x.id === epSerie.value.id)
    if (idx !== -1) series.value[idx] = updated
    epSaved.value = true
    setTimeout(() => { epSaved.value = false }, 2000)
  } catch (e) {
    epError.value = e.message
  }
  epSaving.value = false
}

// ─────────────────────────────────────────────────────────────────────

async function toggleVisible(s) {
  try {
    const updated = await http.put(`/series/${s.id}`, { visible: s.visible === false })
    const idx = series.value.findIndex(x => x.id === s.id)
    if (idx !== -1) series.value[idx] = { ...series.value[idx], visible: updated.visible }
  } catch (e) { alert(e.message) }
}

async function deleteSerie(s) {
  if (!confirm(`Supprimer « ${s.title} » ? Cette action est irréversible.`)) return
  try {
    await http.delete(`/series/${s.id}`)
    series.value = series.value.filter(x => x.id !== s.id)
  } catch (e) { alert(e.message) }
}
</script>

<style scoped>
.admin-input {
  @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors;
}
select.admin-input {
  @apply bg-bg-2;
}
</style>
