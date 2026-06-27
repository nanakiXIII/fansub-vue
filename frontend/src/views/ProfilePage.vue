<template>
  <div class="max-w-4xl mx-auto px-6 py-8 gh-profile-page">

    <!-- ══ En-tête ══ -->
    <div class="flex items-start gap-5 mb-8">
      <div
        class="w-20 h-20 rounded-2xl flex items-center justify-center text-[22px] font-extrabold text-white shrink-0 overflow-hidden gh-profile-avatar"
        :style="settings.uid && isImageUrl(selectedAvatar) ? {} : { background: settings.uid ? (selectedAvatar || defaultAvatar) : settings.username ? 'linear-gradient(135deg, rgb(var(--color-orange)), rgb(var(--color-orange-hover)))' : 'linear-gradient(135deg, #2a2a3a, #1a1a2a)' }"
      >
        <img v-if="settings.uid && isImageUrl(selectedAvatar)" :src="selectedAvatar" class="w-full h-full object-cover" loading="lazy" />
        <span v-else-if="settings.username">{{ initials }}</span>
        <svg v-else class="w-8 h-8 text-ink-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-[22px] font-extrabold text-white leading-tight mb-0.5">
          {{ settings.username ?? 'Visiteur' }}
        </h1>
        <p class="text-[12px] text-ink-3 mb-2">
          {{ settings.uid ? 'Compte connecté' : settings.username ? 'Profil local' : 'Non connecté' }}
        </p>
        <div class="flex flex-wrap items-center gap-1.5">
          <span v-if="settings.isAdmin" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange/20 text-orange border border-orange/30">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            Administrateur
          </span>
          <span v-if="settings.roleLabel" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
            :style="settings.roleColor ? { background: settings.roleColor + '22', color: settings.roleColor, borderColor: settings.roleColor + '44' } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))', borderColor: 'rgba(255,255,255,0.1)' }">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            {{ settings.roleLabel }}
          </span>
          <span v-if="settings.activeTitle?.label" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
            :style="settings.activeTitle.color ? { background: settings.activeTitle.color + '22', color: settings.activeTitle.color, borderColor: settings.activeTitle.color + '44' } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))', borderColor: 'rgba(255,255,255,0.1)' }">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            {{ settings.activeTitle.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══ Stats rapides ══ -->
    <div v-if="settings.username" class="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-8">
      <div class="flex flex-col items-center gap-1 bg-bg-1 border border-white/[0.06] rounded-xl py-3 px-2 gh-profile-stat">
        <span class="text-[20px] font-extrabold text-white leading-none">{{ myComments.length }}</span>
        <span class="text-[10px] text-ink-3 text-center leading-tight">Commentaires</span>
      </div>
      <div class="flex flex-col items-center gap-1 bg-bg-1 border border-white/[0.06] rounded-xl py-3 px-2 gh-profile-stat">
        <span class="text-[20px] font-extrabold leading-none" :class="commentCountApproved ? 'text-green-400' : 'text-ink-3'">{{ commentCountApproved }}</span>
        <span class="text-[10px] text-ink-3 text-center leading-tight">Approuvés</span>
      </div>
      <div class="flex flex-col items-center gap-1 bg-bg-1 border border-white/[0.06] rounded-xl py-3 px-2 gh-profile-stat">
        <span class="text-[20px] font-extrabold leading-none" :class="favoriteSeries.length ? 'text-orange' : 'text-ink-3'">{{ favoriteSeries.length }}</span>
        <span class="text-[10px] text-ink-3 text-center leading-tight">Ma liste</span>
      </div>
      <div class="flex flex-col items-center gap-1 bg-bg-1 border border-white/[0.06] rounded-xl py-3 px-2 gh-profile-stat">
        <span class="text-[20px] font-extrabold leading-none" :class="watchedOver90 ? 'text-white' : 'text-ink-3'">{{ watchedOver90 }}</span>
        <span class="text-[10px] text-ink-3 text-center leading-tight">Épisodes vus</span>
      </div>
      <div class="flex flex-col items-center gap-1 bg-bg-1 border border-white/[0.06] rounded-xl py-3 px-2 gh-profile-stat">
        <span class="text-[20px] font-extrabold leading-none" :class="unlockedAchievements.length ? 'text-orange' : 'text-ink-3'">{{ unlockedAchievements.length }}</span>
        <span class="text-[10px] text-ink-3 text-center leading-tight">Succès</span>
      </div>
    </div>

    <!-- ══ Tabs ══ -->
    <div class="flex border-b border-white/[0.07] mb-6 gh-profile-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="text-[12px] font-semibold px-4 py-2.5 border-b-2 transition-colors gh-profile-tab"
        :class="activeTab === tab.key ? 'text-white border-orange gh-tab-active' : 'text-ink-3 border-transparent hover:text-ink-1'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.key === 'beta' && myBugs.length" class="ml-1.5 text-[10px] bg-orange/20 text-orange rounded-full px-1.5 py-px font-bold">{{ myBugs.length }}</span>
      </button>
    </div>

    <!-- ══ TAB : PROFIL ══ -->
    <div v-if="activeTab === 'about'">

      <!-- Profil local (visiteur / non connecté) -->
      <div v-if="!settings.uid" class="sidebar-card">
        <div class="sidebar-card-header">Profil local</div>
        <div class="p-4">
          <template v-if="settings.username && !showRegisterForm">
            <div class="flex gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/25 mb-4">
              <svg class="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <div class="text-[12px] font-semibold text-green-400 mb-1">Profil local actif</div>
                <p class="text-[11px] text-ink-2 leading-relaxed">Pseudo : <span class="text-ink-1 font-bold">{{ settings.username }}</span>. Vos données sont enregistrées localement dans ce navigateur.</p>
              </div>
            </div>
            <button @click="showRegisterForm = true; newUsername = settings.username" class="btn-ghost text-[12px] py-1.5 px-3">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier le pseudo
            </button>
          </template>
          <template v-else>
            <div v-if="!settings.username" class="flex gap-3 p-3 rounded-xl bg-orange/10 border border-orange/25 mb-4">
              <svg class="w-5 h-5 text-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
              <div>
                <div class="text-[12px] font-semibold text-orange mb-1">Aucun profil local</div>
                <p class="text-[11px] text-ink-2 leading-relaxed">Crée un pseudo local pour personnaliser ton expérience. Tes données restent dans ce navigateur.</p>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Pseudo</label>
              <input v-model.trim="newUsername" type="text" maxlength="24" placeholder="Ex : Otaku_Fan42"
                class="w-full bg-bg-2 border rounded-lg px-3 py-2 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3"
                :class="usernameError ? 'border-red-500/60 focus:border-red-500' : 'border-white/[0.1] focus:border-orange/60'"
                @keydown.enter="submitUsername" />
              <div v-if="usernameError" class="text-[10px] text-red-400 mt-1">{{ usernameError }}</div>
              <div v-else class="text-[10px] text-ink-3 mt-1">3 à 24 caractères · lettres, chiffres et underscores uniquement</div>
            </div>
            <div class="flex gap-2">
              <button @click="submitUsername" :disabled="usernameChecking" class="btn-primary text-[12px] py-1.5 px-3 flex-1 justify-center disabled:opacity-50">
                {{ usernameChecking ? 'Vérification…' : (settings.username ? 'Enregistrer' : 'Créer mon profil') }}
              </button>
              <button v-if="settings.username" @click="showRegisterForm = false; usernameError = ''" class="btn-ghost text-[12px] py-1.5 px-3">Annuler</button>
            </div>
          </template>

          <!-- Compte en ligne (quand non connecté) -->
          <div class="mt-5 pt-5 border-t border-white/[0.06]">
            <div class="text-[12px] font-semibold text-ink-1 mb-3">Compte en ligne</div>
            <div class="flex gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4">
              <svg class="w-5 h-5 text-ink-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
              <div>
                <div class="text-[12px] font-semibold text-ink-1 mb-1">Non connecté</div>
                <p class="text-[11px] text-ink-3 leading-relaxed">Un compte en ligne synchronise ta progression et tes préférences sur tous tes appareils.</p>
              </div>
            </div>
            <div class="flex gap-2">
              <RouterLink to="/connexion" class="btn-primary text-[12px] py-1.5 px-3 flex-1 justify-center">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </RouterLink>
              <RouterLink to="/inscription" class="btn-outline text-[12px] py-1.5 px-3 flex-1 justify-center">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                S'enregistrer
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Compte connecté -->
      <div v-if="settings.uid" class="sidebar-card">
        <div class="sidebar-card-header">Mon compte</div>
        <div class="p-4 flex flex-col gap-6">

          <!-- Avatar -->
          <div>
            <div class="text-[12px] font-semibold text-ink-1 mb-4">Avatar</div>
            <div class="flex items-center gap-5">
              <div class="relative group cursor-pointer shrink-0" @click="fileInput.click()">
                <div class="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center text-[24px] font-extrabold text-white"
                  :style="isImageUrl(selectedAvatar) ? {} : { background: selectedAvatar || defaultAvatar }">
                  <img loading="lazy" v-if="isImageUrl(selectedAvatar)" :src="selectedAvatar" class="w-full h-full object-cover" />
                  <span v-else>{{ initials }}</span>
                </div>
                <div class="absolute inset-0 rounded-xl bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span class="text-white text-[9px] font-semibold mt-0.5">Modifier</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <button type="button" class="btn-outline text-[12px] py-1.5 px-3 mb-2" @click="fileInput.click()">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Téléverser une image
                </button>
                <p class="text-[10px] text-ink-3 mb-3">PNG, JPG, WebP — max. 2 Mo</p>
                <div v-if="uploading" class="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Téléversement en cours…
                </div>
                <div v-else-if="uploadSuccess" class="flex items-center gap-1 text-[11px] text-green-400">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  Avatar mis à jour
                </div>
                <div v-else-if="uploadError" class="text-[11px] text-red-400">{{ uploadError }}</div>
                <div class="flex flex-wrap gap-1.5 mt-1">
                  <button v-for="swatch in avatarSwatches" :key="swatch" type="button"
                    class="w-6 h-6 rounded-full border-2 transition-all duration-150"
                    :class="selectedAvatar === swatch ? 'border-white scale-110' : 'border-transparent hover:border-white/40'"
                    :style="{ background: swatch }"
                    @click="pickSwatch(swatch)" />
                </div>
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden" @change="onFileSelected" />
          </div>

          <!-- Email -->
          <div class="border-t border-white/[0.06] pt-5">
            <label class="block text-[12px] font-semibold text-ink-1 mb-2">Adresse e-mail</label>
            <input v-model.trim="editEmail" type="email" placeholder="votre@email.com"
              class="w-full bg-bg-2 border rounded-lg px-3 py-2 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3"
              :class="editEmailError ? 'border-red-500/60 focus:border-red-500' : 'border-white/[0.1] focus:border-orange/60'"
              @input="editEmailError = ''" />
            <p v-if="editEmailError" class="text-[10px] text-red-400 mt-1">{{ editEmailError }}</p>
            <div class="flex items-center gap-3 mt-3">
              <button class="btn-primary text-[12px] py-1.5 px-4" :disabled="savingProfile" @click="saveEmail">
                <svg v-if="savingProfile" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                {{ savingProfile ? 'Enregistrement…' : "Enregistrer l'e-mail" }}
              </button>
              <span v-if="saveSuccess" class="text-[11px] text-green-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Enregistré
              </span>
              <span v-if="saveError" class="text-[11px] text-red-400">{{ saveError }}</span>
            </div>
          </div>

          <!-- Réseaux & jeux -->
          <div class="border-t border-white/[0.06] pt-5">
            <div class="text-[12px] font-semibold text-ink-1 mb-1">Réseaux & jeux</div>
            <p class="text-[11px] text-ink-3 mb-3">Affichés sur ton profil public si renseignés.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="field in socialFields" :key="field.key">
                <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">{{ field.label }}</label>
                <input v-model.trim="socialsForm[field.key]" type="text" :maxlength="50" :placeholder="field.placeholder"
                  class="w-full bg-bg-2 border border-white/[0.1] focus:border-orange/60 rounded-lg px-3 py-2 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3" />
              </div>
            </div>
            <div class="flex items-center gap-3 mt-3">
              <button class="btn-primary text-[12px] py-1.5 px-4" :disabled="savingSocials" @click="saveSocials">
                <svg v-if="savingSocials" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                {{ savingSocials ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
              <span v-if="socialsSuccess" class="text-[11px] text-green-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Enregistré
              </span>
              <span v-if="socialsError" class="text-[11px] text-red-400">{{ socialsError }}</span>
            </div>
          </div>

          <!-- Films & séries préférés (TMDB) -->
          <div class="border-t border-white/[0.06] pt-5">
            <div class="text-[12px] font-semibold text-ink-1 mb-1">Films & séries préférés</div>
            <p class="text-[11px] text-ink-3 mb-3">Jusqu'à 6 titres affichés sur ton profil public. Recherche propulsée par TMDB.</p>

            <div v-if="!tmdbKey" class="text-[11px] text-orange/80 bg-orange/10 border border-orange/20 rounded-lg px-3 py-2 mb-3">
              Recherche indisponible : aucune clé TMDB configurée sur le site.
            </div>

            <template v-else>
              <div class="relative mb-3">
                <input v-model.trim="tmdbQuery" type="text" placeholder="Rechercher un film ou une série…"
                  class="w-full bg-bg-2 border border-white/[0.1] focus:border-orange/60 rounded-lg px-3 py-2 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3" />
                <div v-if="tmdbSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg class="w-3.5 h-3.5 animate-spin text-ink-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                </div>
              </div>

              <div v-if="tmdbResults.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <button v-for="r in tmdbResults" :key="`${r.mediaType}-${r.tmdbId}`" type="button"
                  class="text-left rounded-lg overflow-hidden border transition-colors"
                  :class="isFavoriteMediaSelected(r) ? 'border-orange/60 opacity-50 cursor-not-allowed' : 'border-white/[0.08] hover:border-orange/40'"
                  :disabled="isFavoriteMediaSelected(r) || favoriteMediaForm.length >= 6"
                  @click="addFavoriteMedia(r)">
                  <div class="aspect-[2/3] bg-bg-2 relative">
                    <img loading="lazy" v-if="r.posterPath" :src="r.posterPath" class="absolute inset-0 w-full h-full object-cover" />
                    <span class="absolute top-1 left-1 text-[8px] font-bold px-1 py-px rounded bg-black/70 text-white uppercase">{{ r.mediaType === 'movie' ? 'Film' : 'Série' }}</span>
                  </div>
                  <div class="px-1.5 py-1">
                    <div class="text-[10px] font-semibold text-ink-1 truncate">{{ r.title }}</div>
                    <div class="text-[9px] text-ink-3">{{ r.year }}</div>
                  </div>
                </button>
              </div>

              <div v-if="favoriteMediaForm.length" class="flex flex-wrap gap-2 mb-3">
                <div v-for="m in favoriteMediaForm" :key="`${m.mediaType}-${m.tmdbId}`" class="flex items-center gap-2 bg-bg-2 border border-white/[0.08] rounded-lg pl-1 pr-2 py-1">
                  <img loading="lazy" v-if="m.posterPath" :src="m.posterPath" class="w-6 h-9 object-cover rounded shrink-0" />
                  <span class="text-[11px] text-ink-1 max-w-[120px] truncate">{{ m.title }}</span>
                  <button type="button" @click="removeFavoriteMedia(m)" class="text-ink-3 hover:text-red-400 transition-colors shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <div v-else class="text-[11px] text-ink-3 mb-3">Aucun titre sélectionné.</div>
            </template>

            <div class="flex items-center gap-3">
              <button class="btn-primary text-[12px] py-1.5 px-4" :disabled="savingFavoriteMedia" @click="saveFavoriteMedia">
                <svg v-if="savingFavoriteMedia" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                {{ savingFavoriteMedia ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
              <span v-if="favoriteMediaSuccess" class="text-[11px] text-green-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Enregistré
              </span>
              <span v-if="favoriteMediaError" class="text-[11px] text-red-400">{{ favoriteMediaError }}</span>
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="border-t border-white/[0.06] pt-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-4 h-4 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div class="text-[12px] font-semibold text-ink-1">Changer le mot de passe</div>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Mot de passe actuel</label>
                <div class="relative">
                  <input v-model="currentPwd" :type="showCurrentPwd ? 'text' : 'password'" placeholder="••••••••"
                    class="w-full bg-bg-2 border border-white/[0.1] focus:border-orange/60 rounded-lg px-3 py-2 pr-10 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3"
                    @input="pwdError = ''" />
                  <button type="button" @click="showCurrentPwd = !showCurrentPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                    <svg v-if="!showCurrentPwd" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Nouveau mot de passe</label>
                <div class="relative">
                  <input v-model="newPwd" :type="showNewPwd ? 'text' : 'password'" placeholder="8 caractères minimum"
                    class="w-full bg-bg-2 border border-white/[0.1] focus:border-orange/60 rounded-lg px-3 py-2 pr-10 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3"
                    @input="pwdError = ''" />
                  <button type="button" @click="showNewPwd = !showNewPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                    <svg v-if="!showNewPwd" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <div v-if="newPwd" class="flex gap-1 mt-2">
                  <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="i <= pwdStrength ? strengthColor : 'bg-bg-3'" />
                </div>
                <p v-if="newPwd" class="text-[10px] mt-1 transition-colors" :class="strengthTextColor">{{ strengthLabel }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Confirmer le nouveau mot de passe</label>
                <div class="relative">
                  <input v-model="confirmPwd" :type="showConfirmPwd ? 'text' : 'password'" placeholder="••••••••"
                    class="w-full bg-bg-2 border border-white/[0.1] focus:border-orange/60 rounded-lg px-3 py-2 pr-10 text-[13px] text-ink-1 outline-none transition-colors placeholder-ink-3"
                    :class="confirmPwd && confirmPwd !== newPwd ? 'border-red-500/40' : ''"
                    @input="pwdError = ''" />
                  <button type="button" @click="showConfirmPwd = !showConfirmPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                    <svg v-if="!showConfirmPwd" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <p v-if="confirmPwd && confirmPwd !== newPwd" class="text-[10px] text-red-400 mt-1">Les mots de passe ne correspondent pas.</p>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <button class="btn-outline text-[12px] py-1.5 px-4" :disabled="changingPwd" @click="changePassword">
                <svg v-if="changingPwd" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                {{ changingPwd ? 'Mise à jour…' : 'Mettre à jour le mot de passe' }}
              </button>
              <span v-if="pwdSuccess" class="text-[11px] text-green-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Mot de passe mis à jour
              </span>
              <span v-if="pwdError" class="text-[11px] text-red-400">{{ pwdError }}</span>
            </div>
          </div>

          <!-- Déconnexion -->
          <div class="border-t border-white/[0.06] pt-5 flex items-center justify-between">
            <div class="text-[12px] font-semibold text-ink-1">Session</div>
            <button @click="logout" class="btn-ghost text-[12px] py-1.5 px-3 text-red-400 border-red-500/30 hover:bg-red-500/10">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <!-- Zone de danger -->
      <div class="sidebar-card" style="border-color: rgb(239 68 68 / 0.2);">
        <div class="sidebar-card-header" style="color: rgb(248 113 113);">Zone de danger</div>
        <div class="p-4 flex items-start justify-between gap-4">
          <div>
            <div class="text-[13px] font-semibold text-ink-1 mb-0.5">Supprimer toutes les données</div>
            <div class="text-[11px] text-ink-3 max-w-sm leading-relaxed">
              <template v-if="settings.uid">Supprime définitivement ton compte du serveur et efface toute la progression, les préférences et les données locales de ce navigateur.</template>
              <template v-else>Efface définitivement la progression, les téléchargements, les préférences et les cookies enregistrés dans ce navigateur.</template>
            </div>
          </div>
          <div class="shrink-0">
            <button v-if="!confirmDelete" @click="confirmDelete = true" class="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap">Supprimer</button>
            <div v-else class="flex flex-col gap-1.5 items-end">
              <span class="text-[10px] text-red-400/70 whitespace-nowrap">Confirmer la suppression ?</span>
              <div class="flex gap-1.5">
                <button @click="confirmDelete = false" class="text-[11px] px-2.5 py-1 rounded-lg bg-bg-2 text-ink-2 hover:text-ink-1 transition-colors">Annuler</button>
                <button @click="deleteAllData" class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ TAB : ACTIVITÉ ══ -->
    <div v-if="activeTab === 'activity'">

      <!-- Sous-navigation Activité -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="sec in activitySections"
          :key="sec.key"
          @click="activityTab = sec.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
          :class="activityTab === sec.key
            ? 'bg-orange text-white'
            : 'bg-bg-2 text-ink-2 hover:text-ink-1 hover:bg-bg-3'"
        >
          {{ sec.label }}
          <span v-if="sec.count" class="text-[10px] font-bold px-1.5 py-px rounded-full"
            :class="activityTab === sec.key ? 'bg-white/20 text-white' : 'bg-white/10 text-ink-3'">
            {{ sec.count }}
          </span>
        </button>
      </div>

      <!-- Succès -->
      <div v-if="activityTab === 'achievements'" class="sidebar-card">
        <div class="sidebar-card-header flex items-center justify-between pr-3">
          <span>Succès</span>
          <span v-if="allAchievements.length" class="text-[10px] font-bold px-2 py-px rounded-full" :class="unlockedAchievements.length ? 'bg-orange/20 text-orange' : 'bg-bg-3 text-ink-3'">
            {{ unlockedAchievements.length }} / {{ allAchievements.length }}
          </span>
        </div>

        <!-- Titre actif -->
        <div v-if="titlesWithReward.length" class="px-4 pt-3 pb-2 border-b border-white/[0.05]">
          <div class="text-[11px] font-semibold text-ink-2 mb-2">Titre affiché</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="ach in titlesWithReward" :key="ach._id" @click="setActiveTitle(ach)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all"
              :class="activeAchievementId === ach._id ? 'ring-2 ring-offset-1 ring-offset-bg-1' : 'opacity-60 hover:opacity-100'"
              :style="{ background: ach.color + '22', color: ach.color, borderColor: ach.color + '55' }">
              {{ ach.icon }} {{ ach.rewardTitle }}
              <svg v-if="activeAchievementId === ach._id" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button v-if="activeAchievementId" @click="setActiveTitle(null)" class="px-2.5 py-1 rounded-full text-[11px] text-ink-3 border border-white/10 hover:text-white transition-colors">✕ Retirer</button>
          </div>
        </div>

        <div v-if="loadingAchievements" class="text-[12px] text-ink-3 py-6 text-center">Chargement…</div>
        <div v-else-if="!allAchievements.length" class="text-[12px] text-ink-3 py-6 text-center px-4">Aucun succès disponible pour l'instant.</div>
        <div v-else class="p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="ach in allAchievements" :key="ach._id"
              class="rounded-xl border p-4 flex items-start gap-3 transition-all gh-ach-card"
              :class="isUnlocked(ach._id) ? 'bg-bg-1 border-white/[0.08]' : 'bg-bg-1/50 border-white/[0.04] opacity-50'">
              <div class="text-[28px] shrink-0 leading-none mt-0.5" :class="isUnlocked(ach._id) ? '' : 'grayscale opacity-40'">{{ ach.icon }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[13px] font-bold" :style="isUnlocked(ach._id) ? { color: ach.color } : { color: 'rgb(var(--color-ink-2))' }">{{ ach.name }}</span>
                  <span v-if="ach.rewardTitle && isUnlocked(ach._id)" class="text-[9px] font-bold px-1.5 py-px rounded-full border"
                    :style="{ background: ach.color + '22', color: ach.color, borderColor: ach.color + '44' }">« {{ ach.rewardTitle }} »</span>
                </div>
                <div class="text-[11px] text-ink-3 mt-0.5 leading-relaxed">{{ ach.description }}</div>
                <div class="mt-2">
                  <div class="flex items-center justify-between mb-1">
                    <span v-if="isUnlocked(ach._id)" class="text-[10px] text-green-400 font-semibold">✓ {{ unlockedDate(ach._id) ? 'Obtenu le ' + unlockedDate(ach._id) : 'Débloqué' }}</span>
                    <span v-else class="text-[10px] text-ink-3">{{ statForType(ach.condition.type) }} / {{ ach.condition.threshold }} {{ CONDITION_LABELS[ach.condition.type] }}</span>
                    <span class="text-[10px] font-bold shrink-0 ml-2" :style="isUnlocked(ach._id) ? { color: '#22c55e' } : { color: ach.color }">{{ progressPct(ach) }}%</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :style="{ width: progressPct(ach) + '%', background: isUnlocked(ach._id) ? '#22c55e' : ach.color }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ma liste -->
      <div v-if="activityTab === 'favorites'" class="sidebar-card">
        <div class="sidebar-card-header flex items-center justify-between pr-3">
          <span>Ma liste</span>
          <button v-if="favoriteSeries.length" @click="favorites.value = []" class="text-[10px] text-ink-3 hover:text-orange transition-colors">Tout retirer</button>
        </div>
        <div v-if="!favoriteSeries.length" class="px-4 py-8 text-center text-[13px] text-ink-3">
          <div class="text-3xl mb-3">♡</div>
          Aucune série dans ta liste pour l'instant.<br>
          <span class="text-[11px]">Utilise le bouton "Ajouter à ma liste" sur les séries qui t'intéressent.</span>
        </div>
        <div v-else class="divide-y divide-white/[0.05]">
          <RouterLink v-for="serie in favoriteSeries" :key="serie.id" :to="`/serie/${serie.id}`"
            class="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors group">
            <div class="w-10 h-14 rounded shrink-0 overflow-hidden relative">
              <img loading="lazy" :src="serie.poster" :alt="serie.titleFull" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0" :style="{ background: serie.gradient, opacity: 0.4 }"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[12px] font-bold text-white truncate mb-0.5">{{ serie.titleFull }}</div>
              <div class="text-[11px] text-ink-2 truncate mb-1">{{ serie.studio }} · {{ serie.year }}</div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[9px] font-bold px-1.5 py-px rounded" :class="serie.status === 'ongoing' ? 'bg-orange/20 text-orange' : 'bg-bg-3 text-ink-3'">{{ serie.status === 'ongoing' ? 'En cours' : 'Terminé' }}</span>
                <span class="text-[10px] text-ink-3">{{ serie.episodesAired }} ép.</span>
                <span v-if="serie.score" class="text-[10px] font-bold text-orange">⭐ {{ serie.score }}</span>
              </div>
            </div>
            <button @click.prevent="toggleFavorite(serie.id)"
              class="unfollow-btn shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 text-orange hover:text-red-400 hover:bg-red-400/10">
              <svg class="unfollow-heart w-4 h-4 fill-orange transition-all" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <svg class="unfollow-heart-broken w-4 h-4 fill-red-400 transition-all" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><line x1="4" y1="4" x2="20" y2="20" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/></svg>
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Historique -->
      <div v-if="activityTab === 'history'" class="sidebar-card">
        <div class="sidebar-card-header flex items-center justify-between pr-3">
          <span>Historique de lecture</span>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 bg-bg-2 rounded-lg p-0.5">
              <button @click="historySort = 'date'" class="px-2 py-1 rounded-md text-[10px] font-semibold transition-all" :class="historySort === 'date' ? 'bg-bg-3 text-ink-1' : 'text-ink-3 hover:text-ink-2'">Par date</button>
              <button @click="historySort = 'serie'" class="px-2 py-1 rounded-md text-[10px] font-semibold transition-all" :class="historySort === 'serie' ? 'bg-bg-3 text-ink-1' : 'text-ink-3 hover:text-ink-2'">Par série</button>
            </div>
            <button v-if="resolvedHistory.length" @click="clearHistory" class="text-[10px] text-ink-3 hover:text-orange transition-colors">Tout effacer</button>
          </div>
        </div>
        <div v-if="!resolvedHistory.length" class="px-4 py-8 text-center text-[13px] text-ink-3">Aucun épisode regardé pour l'instant.</div>
        <!-- Vue par date (liste plate) -->
        <div v-else-if="historySort === 'date'" class="divide-y divide-white/[0.05]">
          <RouterLink v-for="entry in resolvedHistory" :key="`${entry.serieId}-${entry.seasonSlug}-${entry.epNum}`" :to="entry.url"
            class="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors group">
            <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
              <img v-if="entry.episode.thumbnail" loading="lazy" :src="entry.episode.thumbnail" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0" :style="{ background: entry.serie.gradient, opacity: entry.episode.thumbnail ? 0.25 : 1 }"></div>
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-1.5 mb-0.5">
                <span class="text-[12px] font-bold text-white truncate">{{ entry.serie.title }}</span>
                <span v-if="entry.season" class="text-[10px] text-ink-3 shrink-0">{{ entry.season.label }}</span>
              </div>
              <div class="text-[11px] text-ink-2 truncate mb-1.5">EP {{ entry.epNum }} — {{ entry.episode.title }}</div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-[2px] bg-bg-3 rounded overflow-hidden">
                  <div class="h-full bg-orange rounded" :style="{ width: entry.pct + '%' }"></div>
                </div>
                <span class="text-[10px] font-semibold shrink-0" :class="entry.pct >= 100 ? 'text-orange' : 'text-ink-3'">{{ entry.pct >= 100 ? '✓ Vu' : entry.pct + '%' }}</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <span class="text-[10px] text-ink-3">{{ entry.relativeTime }}</span>
              <span class="btn-outline text-[10px] py-1 px-2.5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg v-if="entry.pct >= 90" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/></svg>
                <svg v-else class="w-3 h-3 fill-current" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                {{ entry.pct >= 90 ? 'Revoir' : 'Reprendre' }}
              </span>
            </div>
          </RouterLink>
        </div>
        <!-- Vue par série (groupée) -->
        <div v-else>
          <div v-for="group in groupedHistory" :key="group.serieId" class="border-b border-white/[0.05] last:border-0">
            <!-- En-tête série -->
            <div class="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] cursor-pointer select-none hover:bg-white/[0.04] transition-colors"
                 @click="toggleGroup(historyCollapsed, group.serieId)">
              <svg class="w-3 h-3 text-ink-3 shrink-0 transition-transform duration-200" :class="historyCollapsed[group.serieId] ? '-rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              <span class="flex-1 text-[11px] font-bold text-ink-1 truncate">{{ group.title }}</span>
              <span class="text-[10px] text-ink-3 shrink-0">{{ group.entries.length }} ép.</span>
              <RouterLink :to="`/serie/${group.serieId}`" @click.stop class="text-[10px] text-ink-3 hover:text-orange transition-colors shrink-0 ml-1">Voir la série →</RouterLink>
            </div>
            <!-- Épisodes -->
            <div v-if="!historyCollapsed[group.serieId]">
              <RouterLink v-for="entry in group.entries" :key="`${entry.serieId}-${entry.seasonSlug}-${entry.epNum}`" :to="entry.url"
                class="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors group border-t border-white/[0.05]">
                <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
                  <img v-if="entry.episode.thumbnail" loading="lazy" :src="entry.episode.thumbnail" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0" :style="{ background: entry.serie.gradient, opacity: entry.episode.thumbnail ? 0.25 : 1 }"></div>
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-1.5 mb-0.5">
                    <span class="text-[11px] text-ink-2 truncate">EP {{ entry.epNum }} — {{ entry.episode.title }}</span>
                    <span v-if="entry.season" class="text-[10px] text-ink-3 shrink-0">{{ entry.season.label }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-[2px] bg-bg-3 rounded overflow-hidden">
                      <div class="h-full bg-orange rounded" :style="{ width: entry.pct + '%' }"></div>
                    </div>
                    <span class="text-[10px] font-semibold shrink-0" :class="entry.pct >= 100 ? 'text-orange' : 'text-ink-3'">{{ entry.pct >= 100 ? '✓ Vu' : entry.pct + '%' }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <span class="text-[10px] text-ink-3">{{ entry.relativeTime }}</span>
                  <span class="btn-outline text-[10px] py-1 px-2.5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg v-if="entry.pct >= 90" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/></svg>
                    <svg v-else class="w-3 h-3 fill-current" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                    {{ entry.pct >= 90 ? 'Revoir' : 'Reprendre' }}
                  </span>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Téléchargements -->
      <div v-if="activityTab === 'downloads'" class="sidebar-card">
        <div class="sidebar-card-header flex items-center justify-between pr-3">
          <span>Téléchargements</span>
          <div v-if="resolvedDownloads.length" class="flex items-center gap-1 bg-bg-2 rounded-lg p-0.5">
            <button @click="downloadSort = 'date'" class="px-2 py-1 rounded-md text-[10px] font-semibold transition-all" :class="downloadSort === 'date' ? 'bg-bg-3 text-ink-1' : 'text-ink-3 hover:text-ink-2'">Par date</button>
            <button @click="downloadSort = 'serie'" class="px-2 py-1 rounded-md text-[10px] font-semibold transition-all" :class="downloadSort === 'serie' ? 'bg-bg-3 text-ink-1' : 'text-ink-3 hover:text-ink-2'">Par série</button>
          </div>
        </div>
        <div v-if="!resolvedDownloads.length" class="px-4 py-8 text-center text-[13px] text-ink-3">Aucun téléchargement pour l'instant.</div>
        <!-- Vue par date (liste plate) -->
        <div v-else-if="downloadSort === 'date'" class="divide-y divide-white/[0.05]">
          <RouterLink v-for="entry in resolvedDownloads" :key="`${entry.serieId}-${entry.seasonSlug}-${entry.epNum}`" :to="entry.url"
            class="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors group">
            <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
              <img v-if="entry.episode.thumbnail" loading="lazy" :src="entry.episode.thumbnail" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0" :style="{ background: entry.serie.gradient, opacity: entry.episode.thumbnail ? 0.25 : 1 }"></div>
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-1.5 mb-0.5">
                <span class="text-[12px] font-bold text-white truncate">{{ entry.serie.title }}</span>
                <span v-if="entry.season" class="text-[10px] text-ink-3 shrink-0">{{ entry.season.label }}</span>
              </div>
              <div class="text-[11px] text-ink-2 truncate">EP {{ entry.epNum }} — {{ entry.episode.title }}</div>
            </div>
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <span class="text-[10px] text-ink-3">{{ entry.formattedDate }}</span>
              <div class="flex items-center gap-1">
                <span v-if="entry.quality" class="text-[9px] font-bold bg-bg-3 text-ink-2 rounded px-1.5 py-px uppercase">{{ entry.quality }}</span>
                <span class="flex items-center gap-0.5 text-[9px] font-bold text-orange bg-orange/10 rounded px-1.5 py-px">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  DL
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
        <!-- Vue par série (groupée) -->
        <div v-else>
          <div v-for="group in groupedDownloads" :key="group.serieId" class="border-b border-white/[0.05] last:border-0">
            <!-- En-tête série -->
            <div class="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] cursor-pointer select-none hover:bg-white/[0.04] transition-colors"
                 @click="toggleGroup(downloadCollapsed, group.serieId)">
              <svg class="w-3 h-3 text-ink-3 shrink-0 transition-transform duration-200" :class="downloadCollapsed[group.serieId] ? '-rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              <span class="flex-1 text-[11px] font-bold text-ink-1 truncate">{{ group.title }}</span>
              <span class="text-[10px] text-ink-3 shrink-0">{{ group.entries.length }} ép.</span>
              <RouterLink :to="`/serie/${group.serieId}`" @click.stop class="text-[10px] text-ink-3 hover:text-orange transition-colors shrink-0 ml-1">Voir la série →</RouterLink>
            </div>
            <!-- Épisodes -->
            <div v-if="!downloadCollapsed[group.serieId]">
              <RouterLink v-for="entry in group.entries" :key="`${entry.serieId}-${entry.seasonSlug}-${entry.epNum}`" :to="entry.url"
                class="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors group border-t border-white/[0.05]">
                <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
                  <img v-if="entry.episode.thumbnail" loading="lazy" :src="entry.episode.thumbnail" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0" :style="{ background: entry.serie.gradient, opacity: entry.episode.thumbnail ? 0.25 : 1 }"></div>
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-1.5 mb-0.5">
                    <span class="text-[11px] text-ink-2 truncate">EP {{ entry.epNum }} — {{ entry.episode.title }}</span>
                    <span v-if="entry.season" class="text-[10px] text-ink-3 shrink-0">{{ entry.season.label }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <span class="text-[10px] text-ink-3">{{ entry.formattedDate }}</span>
                  <div class="flex items-center gap-1">
                    <span v-if="entry.quality" class="text-[9px] font-bold bg-bg-3 text-ink-2 rounded px-1.5 py-px uppercase">{{ entry.quality }}</span>
                    <span class="flex items-center gap-0.5 text-[9px] font-bold text-orange bg-orange/10 rounded px-1.5 py-px">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      DL
                    </span>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ TAB : PARAMÈTRES ══ -->
    <div v-if="activeTab === 'settings'">

      <!-- Lecture -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Lecture</div>
        <div class="px-4 py-3 flex items-center justify-between gap-4 border-b border-white/[0.05]">
          <div>
            <div class="text-[13px] font-semibold text-ink-1 mb-0.5">Vue du catalogue</div>
            <div class="text-[11px] text-ink-3">Vue par défaut à l'ouverture du catalogue.</div>
          </div>
          <div class="flex items-center gap-1 bg-bg-2 rounded-lg p-0.5 shrink-0">
            <button @click="settings.catalogueView = 'grid'"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150"
              :class="settings.catalogueView === 'grid' ? 'bg-orange text-white' : 'text-ink-2 hover:text-ink-1'">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <rect x="1" y="1" width="5" height="5" rx="1"/><rect x="9" y="1" width="5" height="5" rx="1"/>
                <rect x="1" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
              </svg>
              Grille
            </button>
            <button @click="settings.catalogueView = 'list'"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150"
              :class="settings.catalogueView === 'list' ? 'bg-orange text-white' : 'text-ink-2 hover:text-ink-1'">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <line x1="5" y1="4" x2="15" y2="4"/><line x1="5" y1="8" x2="15" y2="8"/><line x1="5" y1="12" x2="15" y2="12"/>
                <circle cx="2" cy="4" r="1" fill="currentColor"/><circle cx="2" cy="8" r="1" fill="currentColor"/><circle cx="2" cy="12" r="1" fill="currentColor"/>
              </svg>
              Liste
            </button>
          </div>
        </div>
        <div class="p-4 flex items-center justify-between gap-4">
          <div>
            <div class="text-[13px] font-semibold text-ink-1 mb-0.5">Utiliser le streaming</div>
            <div class="text-[11px] text-ink-3 max-w-sm leading-relaxed">Si désactivé, les boutons de lecture sont remplacés par des liens de téléchargement directs.</div>
          </div>
          <button @click="settings.streaming = !settings.streaming"
            class="relative shrink-0 w-12 h-6 rounded-full transition-all duration-200 focus:outline-none"
            :class="settings.streaming ? 'bg-orange' : 'bg-white/10 ring-1 ring-inset ring-white/20'">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-200"
              :class="settings.streaming ? 'translate-x-6 bg-white' : 'bg-white/40'"></span>
          </button>
        </div>
      </div>

      <!-- Thème -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Thème</div>
        <div class="p-4">
          <div class="text-[11px] text-ink-3 mb-3 leading-relaxed max-w-md">Choisis la palette de couleurs utilisée sur l'ensemble du site.</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button v-for="t in themes" :key="t.id" type="button"
              class="rounded-lg border-2 p-2.5 text-left transition-colors cursor-pointer"
              :class="theme === t.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2 hover:border-white/25'"
              @click="theme = t.id">
              <div class="flex gap-1 mb-2">
                <span v-for="c in t.swatch" :key="c" class="w-5 h-5 rounded-full block border border-white/10" :style="{ background: c }"></span>
              </div>
              <div class="flex items-center gap-1.5 text-[12px] font-semibold text-ink-1">
                {{ t.label }}
                <svg v-if="theme === t.id" class="w-3.5 h-3.5 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Template -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Template</div>
        <div class="p-4">
          <div class="text-[11px] text-ink-3 mb-3 leading-relaxed max-w-md">Choisis la mise en page globale du site.</div>
          <div class="flex gap-3">
            <button v-for="l in layouts" :key="l.id" type="button"
              class="flex-1 rounded-lg border-2 p-3 text-center transition-all cursor-pointer"
              :class="layout === l.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2 hover:border-white/25'"
              @click="layout = l.id">
              <div class="text-[22px] mb-1.5 leading-none">{{ l.icon }}</div>
              <div class="text-[12px] font-semibold text-ink-1 flex items-center justify-center gap-1.5">
                {{ l.label }}
                <svg v-if="layout === l.id" class="w-3.5 h-3.5 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Apparence -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Apparence</div>
        <div class="p-4 flex gap-5 flex-wrap sm:flex-nowrap">
          <div class="flex-1 min-w-[220px]">
            <div class="flex items-center justify-between gap-4 mb-3">
              <div>
                <div class="text-[13px] font-semibold text-ink-1 mb-0.5">Dégradés sur les images</div>
                <div class="text-[11px] text-ink-3 max-w-xs leading-relaxed">Règle l'intensité de la teinte colorée appliquée par-dessus les affiches et bannières du site.</div>
              </div>
              <span class="text-[13px] font-extrabold text-orange shrink-0">{{ overlayOpacity }}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" v-model.number="overlayOpacity" class="w-full accent-orange cursor-pointer" />
            <div class="flex justify-between text-[10px] text-ink-3 mt-1">
              <span>Image pure</span>
              <span>Dégradé plein</span>
            </div>
          </div>
          <div class="shrink-0 w-28">
            <div class="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 relative">
              <img loading="lazy" :src="previewImage" alt="Aperçu" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0 mix-blend-multiply" :style="{ background: previewGradient, opacity: overlayAlpha }"></div>
              <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0) / 0.65) 0%, transparent 55%)"></div>
            </div>
            <div class="text-[10px] text-ink-3 text-center mt-1.5">Aperçu en direct</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ TAB : BÊTA ══ -->
    <div v-if="activeTab === 'beta'">
      <div class="sidebar-card">
        <div class="sidebar-card-header">Mes rapports de bugs</div>
        <div v-if="loadingBugs" class="py-10 text-center text-[12px] text-ink-3">Chargement…</div>
        <div v-else-if="!myBugs.length" class="py-10 text-center text-[12px] text-ink-3">Aucun rapport envoyé pour l'instant.</div>
        <div v-else class="divide-y divide-white/[0.05]">
          <div v-for="bug in myBugs" :key="bug._id" class="px-4 py-4">
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <span class="text-[9px] font-bold px-2 py-0.5 rounded" :class="bugStatusClass(bug.status)">{{ bugStatusLabel(bug.status) }}</span>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded" :class="bugPriorityClass(bug.priority)">{{ bugPriorityLabel(bug.priority) }}</span>
              <span class="text-[10px] text-ink-3 ml-auto">{{ formatBugDate(bug.createdAt) }}</span>
            </div>
            <div class="text-[13px] font-bold text-white mb-1">{{ bug.title || '(sans titre)' }}</div>
            <p class="text-[11px] text-ink-2 whitespace-pre-wrap mb-2">{{ bug.description }}</p>
            <div v-if="bug.url" class="text-[10px] text-ink-3 mb-2 truncate">🔗 {{ bug.url }}</div>
            <div v-if="bug.reply?.text" class="mt-3 bg-orange/5 border border-orange/20 rounded-xl px-3 py-3">
              <div class="flex items-center gap-1.5 mb-1.5">
                <svg class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="text-[10px] font-bold text-orange">Réponse de {{ bug.reply.author }}</span>
                <span class="text-[9px] text-ink-3 ml-auto">{{ formatBugDate(bug.reply.repliedAt) }}</span>
              </div>
              <p class="text-[11px] text-ink-1 whitespace-pre-wrap">{{ bug.reply.text }}</p>
            </div>
            <div v-else class="mt-2 text-[10px] text-ink-3 italic">Aucune réponse pour l'instant.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useBeta } from '@/composables/useBeta.js'
import { overlayOpacity, overlayAlpha } from '@/composables/useImageOverlay.js'
import { theme, themes, layout, layouts } from '@/composables/useTheme.js'
import { useProgress } from '@/composables/useProgress.js'
import { useSettings } from '@/composables/useSettings.js'
import { useDownloads } from '@/composables/useDownloads.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { userId } from '@/composables/useUserId.js'
import { http } from '@/services/http.js'
import { authService } from '@/services/auth.js'
import { tmdbKey, searchTmdbMulti } from '@/composables/useTmdb.js'
import { useAuth } from '@/composables/useAuth.js'

const { logout, user: authUser } = useAuth()

const settings = useSettings()
const { store: progressStore, watchHistory, clearHistory } = useProgress()
const { store: downloadStore, dlHistory } = useDownloads()
const { favorites, isFavorite, toggleFavorite } = useFavorites()

const allSeries = ref([])
function findSerie(id) { return allSeries.value.find(s => s.id === id) ?? null }

// ── Succès ──────────────────────────────────────────────────────
const allAchievements     = ref([])
const serverUnlocked      = ref([])
const serverStats         = ref({})
const loadingAchievements = ref(false)
const activeAchievementId = ref(null)

const userStats = computed(() => {
  if (settings.uid) return serverStats.value
  return {
    downloads: dlHistory.value.length,
    watched:   watchHistory.value.filter(h =>
      (progressStore[h.serieId]?.[h.seasonSlug]?.[h.epNum] ?? 0) >= 90
    ).length,
    favorites: favorites.value.length,
    comments:  0,
    days:      0,
  }
})

const unlockedAchievements = computed(() => {
  if (settings.uid) return serverUnlocked.value
  return allAchievements.value.filter(a =>
    (userStats.value[a.condition.type] ?? 0) >= a.condition.threshold
  ).map(a => ({ ...a, unlockedAt: null }))
})

const unlockedMap = computed(() => {
  const m = {}
  for (const a of unlockedAchievements.value) m[a._id] = a
  return m
})
const titlesWithReward = computed(() =>
  unlockedAchievements.value.filter(a => a.rewardTitle)
)
function isUnlocked(id) { return !!unlockedMap.value[id] }
function unlockedDate(id) {
  const a = unlockedMap.value[id]
  if (!a?.unlockedAt) return ''
  return new Date(a.unlockedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CONDITION_LABELS = {
  downloads: 'téléchargements',
  comments:  'commentaires',
  watched:   'épisodes regardés',
  favorites: 'séries en liste',
  days:      'jours depuis inscription',
}

async function loadAchievements() {
  loadingAchievements.value = true
  try {
    allAchievements.value = await http.get('/achievements')
    if (settings.uid) {
      const [mine, stats] = await Promise.all([
        http.get('/achievements/my'),
        http.get('/achievements/stats'),
      ])
      serverUnlocked.value = mine
      serverStats.value    = stats
      if (settings.activeTitle) {
        const match = mine.find(a => a.rewardTitle === settings.activeTitle.label)
        activeAchievementId.value = match?._id ?? null
      }
    }
  } catch {}
  loadingAchievements.value = false
}

function statForType(type) { return userStats.value[type] ?? 0 }
function progressPct(ach) {
  if (isUnlocked(ach._id)) return 100
  const current = statForType(ach.condition.type)
  return Math.min(100, Math.round((current / ach.condition.threshold) * 100))
}

async function setActiveTitle(ach) {
  try {
    if (settings.uid) {
      await http.patch('/achievements/active', { achievementId: ach?._id ?? null })
    }
    activeAchievementId.value = ach?._id ?? null
    settings.activeTitle = ach ? { label: ach.rewardTitle, color: ach.color } : null
  } catch (e) { alert(e.message) }
}

const showRegisterForm = ref(false)
const newUsername      = ref('')
const usernameError    = ref('')

const initials = computed(() =>
  (settings.username ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
)

const usernameChecking = ref(false)

async function submitUsername() {
  const val = newUsername.value.trim()
  if (val.length < 3) {
    usernameError.value = 'Le pseudo doit contenir au moins 3 caractères.'
    return
  }
  if (val.length > 24) {
    usernameError.value = 'Le pseudo ne peut pas dépasser 24 caractères.'
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(val)) {
    usernameError.value = 'Lettres, chiffres et underscores uniquement.'
    return
  }
  usernameChecking.value = true
  usernameError.value    = ''
  try {
    const result = await authService.checkUsername(val)
    if (!result.available) {
      usernameError.value = 'Ce pseudo est déjà utilisé par un compte enregistré.'
      return
    }
  } catch {
    // API injoignable : on laisse passer
  } finally {
    usernameChecking.value = false
  }
  settings.uid           = null
  settings.username      = val
  showRegisterForm.value = false
  usernameError.value    = ''
  newUsername.value      = ''
}

const previewImage    = 'https://picsum.photos/seed/naruto/300/450'
const previewGradient = 'linear-gradient(155deg,#2a1505,#4a2408,#1a0d02)'

const { betaEnabled } = useBeta()

const tabs = computed(() => [
  { key: 'about',    label: 'Profil'     },
  { key: 'activity', label: 'Activité'   },
  { key: 'settings', label: 'Paramètres' },
  ...(betaEnabled.value && settings.uid ? [{ key: 'beta', label: 'Bêta' }] : []),
])
const route = useRoute()
const validTabs = ['about', 'activity', 'settings', 'beta']
const activeTab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'about')
watch(() => route.query.tab, (tab) => { if (validTabs.includes(tab)) activeTab.value = tab })

const activityTab = ref('achievements')
const historySort  = ref('date')
const downloadSort = ref('date')

const groupedHistory = computed(() => {
  const groups = {}
  for (const e of resolvedHistory.value) {
    if (!groups[e.serieId]) groups[e.serieId] = { serieId: e.serieId, title: e.serie?.title || e.serieId, entries: [] }
    groups[e.serieId].entries.push(e)
  }
  return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title, 'fr'))
})

const groupedDownloads = computed(() => {
  const groups = {}
  for (const e of resolvedDownloads.value) {
    if (!groups[e.serieId]) groups[e.serieId] = { serieId: e.serieId, title: e.serie?.title || e.serieId, entries: [] }
    groups[e.serieId].entries.push(e)
  }
  return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title, 'fr'))
})

const historyCollapsed  = ref({})
const downloadCollapsed = ref({})
function toggleGroup(collapsed, serieId) {
  collapsed.value = { ...collapsed.value, [serieId]: !collapsed.value[serieId] }
}
const activitySections = computed(() => [
  { key: 'achievements', label: 'Succès',          count: unlockedAchievements.value.length || null },
  { key: 'favorites',    label: 'Ma liste',         count: favoriteSeries.value.length || null },
  { key: 'history',      label: 'Historique',       count: resolvedHistory.value.length || null },
  { key: 'downloads',    label: 'Téléchargements',  count: resolvedDownloads.value.length || null },
])

// ── Bugs bêta ─────────────────────────────────────────────────────
const myBugs     = ref([])
const loadingBugs = ref(false)

async function loadMyBugs() {
  if (!settings.uid) return
  loadingBugs.value = true
  try { myBugs.value = await http.get('/bugs/mine') } catch {}
  finally { loadingBugs.value = false }
}

const BUG_STATUS = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé' }
const BUG_PRIORITY = { low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' }
function bugStatusLabel(s)   { return BUG_STATUS[s]   ?? s }
function bugPriorityLabel(p) { return BUG_PRIORITY[p] ?? p }
function bugStatusClass(s) {
  return { open: 'bg-blue-500/15 text-blue-400', in_progress: 'bg-yellow-500/15 text-yellow-400', resolved: 'bg-green-500/15 text-green-400', closed: 'bg-white/10 text-ink-3' }[s] ?? 'bg-white/10 text-ink-3'
}
function bugPriorityClass(p) {
  return { low: 'bg-white/10 text-ink-3', medium: 'bg-blue-500/10 text-blue-400', high: 'bg-orange/15 text-orange', critical: 'bg-red-500/15 text-red-400' }[p] ?? 'bg-white/10 text-ink-3'
}
function formatBugDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const favoriteSeries = computed(() =>
  favorites.value.map(id => findSerie(id)).filter(Boolean)
)

const confirmDelete = ref(false)

const myUserId   = computed(() => settings.uid ?? userId)
const userComments = ref([])

onMounted(async () => {
  try { allSeries.value = await http.get('/series') } catch {}
  loadAchievements()
  loadMyBugs()
  const uid = myUserId.value
  if (!uid) return
  try {
    const res = await http.get(`/comments?userId=${encodeURIComponent(uid)}&limit=200`)
    userComments.value = Array.isArray(res) ? res : (res?.comments ?? [])
  } catch {}
})

const myComments           = computed(() => userComments.value)
const commentCountApproved = computed(() => userComments.value.filter(c => c.status === 'approved').length)
const commentCountPending  = computed(() => userComments.value.filter(c => c.status === 'pending').length)
const watchedOver90        = computed(() => resolvedHistory.value.filter(e => e.pct >= 90).length)

const avatarSwatches = [
  'linear-gradient(135deg,#f97316,#fb923c)',
  'linear-gradient(135deg,#ef4444,#f87171)',
  'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  'linear-gradient(135deg,#3b82f6,#60a5fa)',
  'linear-gradient(135deg,#06b6d4,#22d3ee)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
  'linear-gradient(135deg,#6366f1,#818cf8)',
  'linear-gradient(135deg,#14b8a6,#2dd4bf)',
]
const defaultAvatar = 'linear-gradient(135deg,#f97316,#fb923c)'

const editEmail      = ref('')
const editEmailError = ref('')
const selectedAvatar = ref('')
const savingProfile  = ref(false)
const saveSuccess    = ref(false)
const saveError      = ref('')

const socialsForm   = reactive({ discord: '', psn: '', xbox: '', switch: '', steam: '', myanimelist: '' })
const savingSocials = ref(false)
const socialsSuccess = ref(false)
const socialsError   = ref('')
const socialFields = [
  { key: 'discord',     label: 'Discord',       placeholder: 'pseudo#0000 ou @pseudo' },
  { key: 'psn',         label: 'PSN',           placeholder: 'Identifiant PlayStation' },
  { key: 'xbox',        label: 'Xbox Live',     placeholder: 'Gamertag Xbox' },
  { key: 'switch',      label: 'Nintendo Switch', placeholder: 'Code ami SW-0000-0000-0000' },
  { key: 'steam',       label: 'Steam',         placeholder: "Nom d'utilisateur Steam" },
  { key: 'myanimelist', label: 'MyAnimeList',   placeholder: "Nom d'utilisateur MAL" },
]

// ── Films & séries préférés (TMDB) ──────────────────────────────────
const tmdbQuery       = ref('')
const tmdbResults     = ref([])
const tmdbSearching   = ref(false)
const favoriteMediaForm     = ref([])
const savingFavoriteMedia   = ref(false)
const favoriteMediaSuccess  = ref(false)
const favoriteMediaError    = ref('')

let tmdbSearchTimer = null
watch(tmdbQuery, (q) => {
  clearTimeout(tmdbSearchTimer)
  if (!q.trim()) { tmdbResults.value = []; return }
  tmdbSearchTimer = setTimeout(async () => {
    tmdbSearching.value = true
    try {
      tmdbResults.value = await searchTmdbMulti(q)
    } catch {
      tmdbResults.value = []
    } finally {
      tmdbSearching.value = false
    }
  }, 400)
})

function isFavoriteMediaSelected(m) {
  return favoriteMediaForm.value.some(f => f.tmdbId === m.tmdbId && f.mediaType === m.mediaType)
}
function addFavoriteMedia(m) {
  if (isFavoriteMediaSelected(m) || favoriteMediaForm.value.length >= 6) return
  favoriteMediaForm.value = [...favoriteMediaForm.value, m]
}
function removeFavoriteMedia(m) {
  favoriteMediaForm.value = favoriteMediaForm.value.filter(f => !(f.tmdbId === m.tmdbId && f.mediaType === m.mediaType))
}

async function saveFavoriteMedia() {
  favoriteMediaError.value   = ''
  favoriteMediaSuccess.value = false
  savingFavoriteMedia.value  = true
  try {
    const updated = await authService.updateProfile({ favoriteMedia: favoriteMediaForm.value })
    authUser.value = updated
    favoriteMediaSuccess.value = true
    setTimeout(() => { favoriteMediaSuccess.value = false }, 3000)
  } catch (err) {
    favoriteMediaError.value = err.message || 'Erreur lors de la sauvegarde.'
  } finally {
    savingFavoriteMedia.value = false
  }
}

const fileInput     = ref(null)
const uploading     = ref(false)
const uploadSuccess = ref(false)
const uploadError   = ref('')

const currentPwd    = ref('')
const newPwd        = ref('')
const confirmPwd    = ref('')
const pwdError      = ref('')
const pwdSuccess    = ref(false)
const changingPwd   = ref(false)
const showCurrentPwd = ref(false)
const showNewPwd     = ref(false)
const showConfirmPwd = ref(false)

function isImageUrl(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('https') || val.startsWith('data:'))
}

const pwdStrength = computed(() => {
  const p = newPwd.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) || /[^a-zA-Z0-9]/.test(p)) score++
  return Math.max(1, score)
})
const strengthColor = computed(() => {
  const s = pwdStrength.value
  if (s <= 1) return 'bg-red-500'
  if (s === 2) return 'bg-orange'
  if (s === 3) return 'bg-yellow-400'
  return 'bg-green-500'
})
const strengthTextColor = computed(() => {
  const s = pwdStrength.value
  if (s <= 1) return 'text-red-400'
  if (s === 2) return 'text-orange'
  if (s === 3) return 'text-yellow-400'
  return 'text-green-400'
})
const strengthLabel = computed(() => {
  const s = pwdStrength.value
  if (s <= 1) return 'Très faible'
  if (s === 2) return 'Faible'
  if (s === 3) return 'Correct'
  return 'Robuste'
})

watch(authUser, (u) => {
  if (u) {
    editEmail.value      = u.email ?? ''
    selectedAvatar.value = u.avatar ?? defaultAvatar
    Object.assign(socialsForm, {
      discord: '', psn: '', xbox: '', switch: '', steam: '', myanimelist: '',
      ...(u.socials ?? {}),
    })
    favoriteMediaForm.value = u.favoriteMedia ?? []
  }
}, { immediate: true })

async function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedAvatar.value = URL.createObjectURL(file)
  uploading.value      = true
  uploadSuccess.value  = false
  uploadError.value    = ''
  try {
    const { url } = await authService.uploadAvatar(file)
    selectedAvatar.value = url
    settings.avatar      = url
    if (authUser.value) authUser.value = { ...authUser.value, avatar: url }
    uploadSuccess.value  = true
    setTimeout(() => { uploadSuccess.value = false }, 3000)
  } catch (err) {
    uploadError.value    = err.message || 'Erreur lors du téléversement.'
    selectedAvatar.value = authUser.value?.avatar ?? defaultAvatar
  } finally {
    uploading.value = false
    e.target.value  = ''
  }
}

async function pickSwatch(swatch) {
  selectedAvatar.value = swatch
  uploadError.value    = ''
  try {
    await authService.updateProfile({ avatar: swatch })
    settings.avatar = swatch
    if (authUser.value) authUser.value = { ...authUser.value, avatar: swatch }
    uploadSuccess.value = true
    setTimeout(() => { uploadSuccess.value = false }, 2000)
  } catch (err) {
    uploadError.value = err.message || 'Erreur lors de la sauvegarde.'
  }
}

async function saveEmail() {
  editEmailError.value = ''
  saveError.value      = ''
  saveSuccess.value    = false
  if (editEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.value)) {
    editEmailError.value = 'Adresse e-mail invalide.'
    return
  }
  savingProfile.value = true
  try {
    const updated    = await authService.updateProfile({ email: editEmail.value || undefined })
    authUser.value   = updated
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    saveError.value = err.message || 'Erreur lors de la sauvegarde.'
  } finally {
    savingProfile.value = false
  }
}

async function saveSocials() {
  socialsError.value   = ''
  socialsSuccess.value = false
  savingSocials.value  = true
  try {
    const updated     = await authService.updateProfile({ socials: { ...socialsForm } })
    authUser.value     = updated
    socialsSuccess.value = true
    setTimeout(() => { socialsSuccess.value = false }, 3000)
  } catch (err) {
    socialsError.value = err.message || 'Erreur lors de la sauvegarde.'
  } finally {
    savingSocials.value = false
  }
}

async function changePassword() {
  pwdError.value   = ''
  pwdSuccess.value = false
  if (!currentPwd.value) { pwdError.value = 'Mot de passe actuel requis.'; return }
  if (newPwd.value.length < 8) { pwdError.value = 'Le mot de passe doit contenir au moins 8 caractères.'; return }
  if (newPwd.value !== confirmPwd.value) { pwdError.value = 'Les mots de passe ne correspondent pas.'; return }
  changingPwd.value = true
  try {
    await authService.updateProfile({ currentPassword: currentPwd.value, newPassword: newPwd.value })
    currentPwd.value = ''
    newPwd.value     = ''
    confirmPwd.value = ''
    pwdSuccess.value = true
    setTimeout(() => { pwdSuccess.value = false }, 3000)
  } catch (err) {
    pwdError.value = err.message || 'Erreur lors du changement de mot de passe.'
  } finally {
    changingPwd.value = false
  }
}

async function deleteAllData() {
  if (settings.uid) {
    try {
      await authService.deleteAccount()
    } catch (err) {
      console.error('[deleteAccount]', err)
    }
  }
  ;['fansub_downloads', 'fansub_settings', 'fansub_uid', 'fansub_consent', 'fansub_favorites', 'fansub_jwt'].forEach(k => localStorage.removeItem(k))
  ;['fansub_progress', 'fansub_uid', 'theme', 'overlayOpacity'].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  })
  window.location.reload()
}

function relativeTime(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1)   return "À l'instant"
  if (m < 60)  return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Hier'
  if (d < 7)   return `Il y a ${d} j`
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formattedDate(ts) {
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function resolveEntry(h, withProgress = false) {
  const serie = findSerie(h.serieId)
  if (!serie) return null
  const sIdx    = parseInt(h.seasonSlug?.replace('saison-', '')) - 1
  const season  = serie.seasons?.[sIdx] ?? null
  const eps     = season?.episodes ?? serie.episodes ?? []
  const episode = eps.find(e => e.num === h.epNum)
  if (!episode) return null
  return {
    ...h,
    serie,
    season,
    episode,
    url: `/watch/${h.serieId}/${h.seasonSlug}/episode-${h.epNum}`,
    ...(withProgress ? {
      pct: progressStore[h.serieId]?.[h.seasonSlug]?.[h.epNum] ?? 0,
      relativeTime: relativeTime(h.at),
    } : {
      formattedDate: formattedDate(h.at),
    }),
  }
}

const resolvedDownloads = computed(() =>
  dlHistory.value.map(h => {
    const entry = resolveEntry(h)
    if (!entry) return null
    return { ...entry, url: `/serie/${h.serieId}#episodes` }
  }).filter(Boolean)
)

const resolvedHistory = computed(() =>
  watchHistory.value.map(h => resolveEntry(h, true)).filter(Boolean)
)
</script>

<style scoped>
.unfollow-heart        { display: block; }
.unfollow-heart-broken { display: none;  }
.unfollow-btn:hover .unfollow-heart        { display: none;  }
.unfollow-btn:hover .unfollow-heart-broken { display: block; }
</style>
