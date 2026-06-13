<template>
  <div class="-m-5 flex h-[calc(100vh-3.5rem)] overflow-hidden">

    <!-- ══ GAUCHE : Formulaire ══ -->
    <div class="flex-1 min-w-0 flex flex-col border-r border-white/[0.07]">

      <!-- Header fixe -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] bg-bg-1/80 backdrop-blur-sm shrink-0">
        <div class="flex items-center gap-3">
          <RouterLink to="/admin/news" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </RouterLink>
          <h1 class="text-[14px] font-bold text-white">{{ isEdit ? 'Modifier l\'article' : 'Nouvel article' }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <p v-if="formError" class="text-[11px] text-red-400 max-w-[180px] truncate">{{ formError }}</p>
          <!-- Toggle publié / brouillon -->
          <button
            type="button"
            @click="form.published = !form.published"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors"
            :class="form.published
              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
              : 'bg-bg-2 border-white/10 text-ink-3 hover:border-white/20 hover:text-ink-1'"
          >
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="form.published ? 'bg-green-400' : 'bg-ink-3'"></span>
            {{ form.published ? 'Publié' : 'Brouillon' }}
          </button>
          <button @click="submitSave" :disabled="saving" class="btn-primary text-[12px] py-1.5 px-4 gap-1.5">
            <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            {{ saving ? 'Enregistrement…' : (isEdit ? 'Enregistrer' : (form.published ? 'Publier' : 'Enregistrer')) }}
          </button>
        </div>
      </div>

      <!-- Corps du formulaire -->
      <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

        <!-- Titre -->
        <div class="flex flex-col gap-1.5">
          <span class="field-label">Titre *</span>
          <input v-model="form.title" class="field-input text-[14px] font-bold" placeholder="Titre de l'article…" />
        </div>

        <!-- Catégorie + Icône -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="field-label">Catégorie *</span>
            <select v-model="form.category" class="field-input">
              <option value="">— Choisir —</option>
              <option>Annonce</option><option>Sortie</option><option>Mise à jour</option>
              <option>Recrutement</option><option>Événement</option><option>Autre</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="field-label">Icône</span>
            <div class="relative" ref="iconPickerRef">
              <button type="button" @click="iconPickerOpen = !iconPickerOpen" class="field-input flex items-center gap-2 cursor-pointer w-full text-left">
                <span class="text-[20px] leading-none">{{ form.icon || '📰' }}</span>
                <span class="text-ink-3 text-[11px] flex-1">Choisir</span>
                <svg class="w-3 h-3 text-ink-3 shrink-0" :class="iconPickerOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div v-if="iconPickerOpen" class="absolute z-50 top-full mt-1 left-0 right-0 bg-bg-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div class="flex flex-col max-h-52 overflow-y-auto p-2 gap-2">
                  <div v-for="cat in iconCategories" :key="cat.label">
                    <div class="text-[9px] font-bold text-ink-3 uppercase tracking-widest px-1 mb-1">{{ cat.label }}</div>
                    <div class="flex flex-wrap gap-0.5">
                      <button v-for="ico in cat.icons" :key="ico" type="button" @mousedown.prevent="selectIcon(ico)" class="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-white/[0.08] transition-colors" :class="form.icon === ico ? 'bg-orange/20 ring-1 ring-orange/50' : ''">{{ ico }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image de couverture -->
        <div class="flex flex-col gap-1.5">
          <span class="field-label">Image de couverture</span>
          <div class="flex gap-3 items-start">
            <div class="w-24 h-16 rounded-lg shrink-0 overflow-hidden border border-white/10 bg-bg-2 flex items-center justify-center" :style="!form.thumb ? { background: form.gradient || '#1a1a2a' } : {}">
              <img loading="lazy" v-if="form.thumb" :src="form.thumb" class="w-full h-full object-cover" />
              <svg v-else class="w-6 h-6 text-ink-3/40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div class="flex-1 flex flex-col gap-2">
              <label class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-bg-2 cursor-pointer hover:border-white/20 transition-colors">
                <svg v-if="!uploading" class="w-3.5 h-3.5 text-ink-2 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <svg v-else class="w-3.5 h-3.5 text-orange animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                <span class="text-[11px] text-ink-2 truncate">{{ uploading ? 'Téléversement…' : 'Choisir un fichier' }}</span>
                <span v-if="uploadError" class="text-[10px] text-red-400 ml-auto">{{ uploadError }}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="onFileChange" />
              </label>
              <input v-model="form.thumb" class="field-input font-mono text-[11px]" placeholder="ou coller une URL…" />
            </div>
          </div>
        </div>

        <!-- Dégradé -->
        <div class="flex flex-col gap-1.5">
          <span class="field-label">Dégradé de fond <span class="text-ink-3 normal-case font-normal">(si pas d'image)</span></span>
          <div class="flex items-center gap-3 p-3 bg-bg-3 rounded-lg border border-white/[0.06]">
            <div class="flex items-center gap-1.5">
              <div v-for="(color, i) in gradStops" :key="i" class="flex flex-col items-center gap-1">
                <input type="color" :value="color" @input="e => setGradStop(i, e.target.value)" class="w-8 h-8 rounded-lg cursor-pointer border border-white/10 p-0.5 bg-transparent" />
                <span class="text-[8px] text-ink-3 font-mono">{{ color }}</span>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="flex items-center gap-1">
                <input type="number" v-model.number="gradAngle" @input="buildGradient" min="0" max="360" class="field-input w-14 text-center px-1 py-1.5" />
                <span class="text-[10px] text-ink-3">°</span>
              </div>
              <span class="text-[8px] text-ink-3">angle</span>
            </div>
            <div class="flex-1 h-12 rounded-lg border border-white/10 min-w-0" :style="{ background: form.gradient || '#1a1a2a' }"></div>
          </div>
          <input v-model="form.gradient" class="field-input font-mono text-[11px]" placeholder="linear-gradient(155deg,#1a0d2e,#2a1050)" @change="parseGradient" />
        </div>

        <!-- Série liée -->
        <div class="flex flex-col gap-1.5">
          <span class="field-label">Série liée <span class="text-ink-3 normal-case font-normal">(optionnel)</span></span>
          <div class="flex gap-2 items-center">
            <input v-model="serieSearch" class="field-input flex-1" placeholder="Rechercher une série…" @focus="serieDropdownOpen = true" @blur="setTimeout(() => serieDropdownOpen = false, 150)" />
            <button v-if="form.serieId" type="button" @click="clearSerie" class="text-ink-3 hover:text-red-400 transition-colors shrink-0 text-[10px]">✕ Retirer</button>
          </div>
          <div v-if="serieDropdownOpen && filteredSeries.length" class="bg-bg-2 border border-white/10 rounded-xl overflow-hidden max-h-44 overflow-y-auto shadow-xl">
            <button v-for="s in filteredSeries" :key="s.id" type="button" @mousedown.prevent="selectSerie(s)" class="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors" :class="form.serieId === s.id ? 'bg-orange/10' : ''">
              <img loading="lazy" v-if="s.poster" :src="s.poster" class="w-7 h-10 object-cover rounded shrink-0" />
              <div v-else class="w-7 h-10 rounded bg-bg-3 shrink-0"></div>
              <div class="min-w-0">
                <div class="text-[12px] text-white truncate font-medium">{{ s.title }}</div>
                <div class="text-[10px] text-ink-3">{{ s.year }}</div>
              </div>
              <svg v-if="form.serieId === s.id" class="w-3.5 h-3.5 text-orange shrink-0 ml-auto" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <div v-if="selectedSerie" class="p-3 bg-bg-2 rounded-xl border border-white/[0.08] flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <img loading="lazy" v-if="selectedSerie.poster" :src="selectedSerie.poster" class="w-8 h-11 object-cover rounded shrink-0" />
              <div>
                <div class="text-[12px] font-bold text-white">{{ selectedSerie.title }}</div>
                <div class="text-[10px] text-ink-3">{{ selectedSerie.year }}</div>
              </div>
            </div>
            <div v-if="availableEpisodes.length">
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-1.5">Épisodes liés</div>
              <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                <button v-for="ep in availableEpisodes" :key="ep.num" type="button" @click="toggleEpisode(ep.num)" class="text-[10px] font-bold px-2 py-1 rounded-md border transition-colors" :class="form.episodeNums.includes(ep.num) ? 'bg-orange/20 border-orange/50 text-orange' : 'bg-bg-3 border-white/10 text-ink-3 hover:border-white/25 hover:text-ink-1'">
                  EP {{ ep.num }}{{ ep.title ? ` — ${ep.title.slice(0, 18)}` : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Source du héro -->
        <div v-if="selectedSerie" class="flex flex-col gap-1.5">
          <span class="field-label">Image du héro</span>
          <div class="flex gap-2">
            <button type="button" @click="form.heroSource = 'custom'"
              class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors"
              :class="form.heroSource !== 'serie' ? 'bg-orange/10 border-orange/40 text-orange' : 'bg-bg-2 border-white/10 text-ink-2 hover:border-white/20'">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Image / dégradé article
            </button>
            <button type="button" @click="form.heroSource = 'serie'"
              :disabled="!selectedSerie.banner"
              class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors"
              :class="form.heroSource === 'serie' ? 'bg-orange/10 border-orange/40 text-orange' : 'bg-bg-2 border-white/10 text-ink-2 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed'">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
              Bannière de la série{{ !selectedSerie.banner ? ' (aucune)' : '' }}
            </button>
          </div>
          <!-- Aperçu bannière -->
          <div v-if="form.heroSource === 'serie' && selectedSerie.banner" class="h-16 rounded-lg overflow-hidden border border-white/10 relative">
            <img loading="lazy" :src="selectedSerie.banner" class="w-full h-full object-cover" />
            <div class="absolute inset-0" :style="{ background: selectedSerie.gradient, opacity: 0.6 }"></div>
          </div>
        </div>

        <!-- Extrait -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="field-label">Extrait</span>
            <button type="button" @click="autoExcerpt" class="flex items-center gap-1 text-[10px] text-ink-3 hover:text-orange transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Générer depuis le contenu
            </button>
          </div>
          <textarea v-model="form.excerpt" class="field-input resize-none h-14" placeholder="Généré automatiquement si laissé vide…"></textarea>
        </div>

        <!-- Contenu riche -->
        <div class="flex flex-col gap-1.5">
          <span class="field-label">Contenu</span>

          <!-- Toolbar -->
          <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-bg-3 border border-white/[0.08] rounded-t-lg" @mousedown.self.prevent>
            <button type="button" @mousedown.prevent="exec('bold')" :class="['tbtn', fmt.bold && 'tbtn-on']" title="Gras"><strong>G</strong></button>
            <button type="button" @mousedown.prevent="exec('italic')" :class="['tbtn', fmt.italic && 'tbtn-on']" title="Italique"><em>I</em></button>
            <button type="button" @mousedown.prevent="exec('underline')" :class="['tbtn', fmt.underline && 'tbtn-on']" title="Souligné"><u>S</u></button>
            <button type="button" @mousedown.prevent="exec('strikeThrough')" :class="['tbtn', fmt.strikeThrough && 'tbtn-on']" title="Barré"><s>B</s></button>
            <div class="tbsep"></div>

            <!-- Format bloc -->
            <div class="relative">
              <button type="button" @mousedown.prevent="fmtDropOpen = !fmtDropOpen; sizeDropOpen = false; colorDropOpen = false" class="tbtn flex items-center gap-1 px-2">
                <span class="text-[11px] w-16 text-left truncate">{{ currentBlockLabel }}</span>
                <svg class="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div v-if="fmtDropOpen" class="absolute top-full left-0 mt-1 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl z-30 min-w-[150px] overflow-hidden py-1">
                <button @mousedown.prevent="applyBlock('p')"          class="fmtopt text-[12px]">Paragraphe</button>
                <button @mousedown.prevent="applyBlock('h2')"         class="fmtopt font-extrabold text-[18px] leading-tight">Titre</button>
                <button @mousedown.prevent="applyBlock('h3')"         class="fmtopt font-bold text-[15px]">Sous-titre</button>
                <button @mousedown.prevent="applyBlock('h4')"         class="fmtopt font-semibold text-[13px]">Petit titre</button>
                <div class="border-t border-white/[0.06] my-1"></div>
                <button @mousedown.prevent="applyBlock('blockquote')" class="fmtopt italic text-ink-3 text-[12px]">❝ Citation</button>
              </div>
            </div>

            <!-- Taille -->
            <div class="relative">
              <button type="button" @mousedown.prevent="sizeDropOpen = !sizeDropOpen; fmtDropOpen = false; colorDropOpen = false" class="tbtn flex items-center gap-1 px-1.5" title="Taille de police">
                <span class="text-[11px]">{{ currentFontSize }}</span>
                <svg class="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div v-if="sizeDropOpen" class="absolute top-full left-0 mt-1 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                <button v-for="s in fontSizes" :key="s.val" @mousedown.prevent="applyFontSize(s.val)" class="fmtopt whitespace-nowrap" :style="{ fontSize: s.px }">{{ s.label }}</button>
              </div>
            </div>

            <!-- Couleur -->
            <div class="relative">
              <button type="button" @mousedown.prevent="colorDropOpen = !colorDropOpen; fmtDropOpen = false; sizeDropOpen = false" class="tbtn px-1.5 flex flex-col items-center gap-0.5" title="Couleur">
                <span class="text-[13px] font-bold leading-none" :style="{ color: selectedColor }">A</span>
                <div class="w-4 h-1 rounded-full" :style="{ background: selectedColor }"></div>
              </button>
              <div v-if="colorDropOpen" class="absolute top-full left-0 mt-1 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl z-30 p-2.5 flex flex-col gap-2">
                <div class="flex flex-wrap gap-1" style="width:144px">
                  <button v-for="c in textColors" :key="c.val" @mousedown.prevent="applyColor(c.val)" class="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform" :style="{ background: c.val }" :title="c.name"></button>
                </div>
                <button @mousedown.prevent="applyColor('inherit')" class="text-[10px] text-ink-3 hover:text-ink-1 transition-colors text-left">Par défaut</button>
              </div>
            </div>

            <div class="tbsep"></div>
            <button type="button" @mousedown.prevent="exec('justifyLeft')"   :class="['tbtn', fmt.justifyLeft   && 'tbtn-on']" title="Gauche">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.75"/><rect x="1" y="5.5" width="9" height="1.5" rx="0.75"/><rect x="1" y="9" width="14" height="1.5" rx="0.75"/><rect x="1" y="12.5" width="9" height="1.5" rx="0.75"/></svg>
            </button>
            <button type="button" @mousedown.prevent="exec('justifyCenter')" :class="['tbtn', fmt.justifyCenter && 'tbtn-on']" title="Centrer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.75"/><rect x="3.5" y="5.5" width="9" height="1.5" rx="0.75"/><rect x="1" y="9" width="14" height="1.5" rx="0.75"/><rect x="3.5" y="12.5" width="9" height="1.5" rx="0.75"/></svg>
            </button>
            <button type="button" @mousedown.prevent="exec('justifyRight')"  :class="['tbtn', fmt.justifyRight  && 'tbtn-on']" title="Droite">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.75"/><rect x="6" y="5.5" width="9" height="1.5" rx="0.75"/><rect x="1" y="9" width="14" height="1.5" rx="0.75"/><rect x="6" y="12.5" width="9" height="1.5" rx="0.75"/></svg>
            </button>
            <div class="tbsep"></div>
            <button type="button" @mousedown.prevent="exec('insertUnorderedList')" :class="['tbtn', fmt.unorderedList && 'tbtn-on']" title="Liste à puces">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="3.75" r="1.25"/><rect x="5" y="3" width="10" height="1.5" rx="0.75"/><circle cx="2" cy="8" r="1.25"/><rect x="5" y="7.25" width="10" height="1.5" rx="0.75"/><circle cx="2" cy="12.25" r="1.25"/><rect x="5" y="11.5" width="10" height="1.5" rx="0.75"/></svg>
            </button>
            <button type="button" @mousedown.prevent="exec('insertOrderedList')"   :class="['tbtn', fmt.orderedList   && 'tbtn-on']" title="Liste numérotée">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><text x="0.5" y="5" font-size="4.5" font-family="monospace">1.</text><rect x="5" y="3" width="10" height="1.5" rx="0.75"/><text x="0.5" y="9.5" font-size="4.5" font-family="monospace">2.</text><rect x="5" y="7.25" width="10" height="1.5" rx="0.75"/><text x="0.5" y="14" font-size="4.5" font-family="monospace">3.</text><rect x="5" y="11.5" width="10" height="1.5" rx="0.75"/></svg>
            </button>
            <div class="tbsep"></div>
            <button type="button" @mousedown.prevent="insertHR"   class="tbtn" title="Séparateur">
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="1" y1="8" x2="15" y2="8" stroke-width="2"/><line x1="2" y1="12" x2="14" y2="12"/></svg>
            </button>
            <button type="button" @mousedown.prevent="insertLink" class="tbtn" title="Lien">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </button>
            <button type="button" @mousedown.prevent="exec('removeFormat')" class="tbtn" title="Effacer formatage">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 9l-8.5 8.5M10 6L6 10M14 4l-8 8M3 21h18"/></svg>
            </button>
          </div>

          <!-- Zone éditable -->
          <div
            ref="editorEl"
            contenteditable="true"
            class="field-input rounded-t-none border-t-0 min-h-[240px] focus:outline-none editor-body"
            @input="onEditorInput"
            @keyup="updateFmt"
            @mouseup="updateFmt"
            @focus="updateFmt"
          ></div>
        </div>

      </div><!-- fin scroll form -->
    </div>

    <!-- ══ DROITE : Prévisualisation ══ -->
    <div class="w-[46%] shrink-0 overflow-y-auto bg-bg-0 flex flex-col">

      <!-- Label -->
      <div class="px-5 py-2.5 border-b border-white/[0.06] flex items-center gap-2 shrink-0 bg-bg-1/60 backdrop-blur-sm">
        <div class="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></div>
        <span class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Prévisualisation en direct</span>
      </div>

      <!-- Hero -->
      <div class="relative min-h-[200px] flex items-end overflow-hidden shrink-0">
        <!-- Bannière série -->
        <template v-if="form.heroSource === 'serie' && selectedSerie?.banner">
          <img loading="lazy" :src="selectedSerie.banner" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0" :style="{ background: selectedSerie.gradient, opacity: 0.55 }"></div>
        </template>
        <!-- Image article ou dégradé -->
        <template v-else>
          <img loading="lazy" v-if="form.thumb" :src="form.thumb" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0" :style="form.thumb
            ? { background: form.gradient || 'linear-gradient(155deg,#0d0d1a,#1a1030)', opacity: 0.55 }
            : { background: form.gradient || 'linear-gradient(155deg,#0d0d1a,#1a1030)' }"></div>
        </template>
        <!-- Fondu bas -->
        <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.35) 55%, transparent 100%)"></div>
        <!-- Screentone -->
        <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>
        <!-- Icon watermark (masqué si bannière série) -->
        <div v-if="form.heroSource !== 'serie'" class="absolute right-8 top-1/2 -translate-y-1/2 text-[90px] leading-none opacity-[0.12] select-none">{{ form.icon || '📰' }}</div>

        <div class="relative z-10 w-full px-6 pb-5">
          <div class="flex items-center gap-2 mb-2">
            <span v-if="form.category" class="badge badge-orange text-[9px]">{{ form.category }}</span>
            <span class="text-[10px] text-ink-3">{{ todayStr }}</span>
          </div>
          <h1 class="text-[18px] font-extrabold text-white leading-tight mb-1">{{ form.title || 'Titre de l\'article…' }}</h1>
          <p class="text-[11px] text-ink-3">Par <span class="text-ink-2">vous</span></p>
        </div>
      </div>

      <!-- Corps -->
      <div class="px-6 pt-5 pb-8 flex flex-col gap-5">

        <!-- Contenu HTML -->
        <div class="news-body" v-if="form.contentHtml" v-html="form.contentHtml"></div>
        <div v-else class="text-[12px] text-ink-3 italic py-4 text-center border border-dashed border-white/[0.07] rounded-lg">
          Le contenu apparaîtra ici…
        </div>

        <!-- Extrait -->
        <div v-if="form.excerpt" class="p-3 bg-bg-1 border border-white/[0.06] rounded-xl">
          <div class="text-[9px] font-bold text-ink-3 uppercase tracking-widest mb-1">Extrait (carte)</div>
          <p class="text-[12px] text-ink-2 leading-relaxed">{{ form.excerpt }}</p>
        </div>

        <!-- Série liée -->
        <div v-if="selectedSerie" class="flex items-center gap-4 bg-bg-1 border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.18] transition-colors">
          <div class="w-12 shrink-0 aspect-[2/3] rounded-lg overflow-hidden relative">
            <img loading="lazy" v-if="selectedSerie.poster" :src="selectedSerie.poster" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-bg-2"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[9px] font-bold text-orange uppercase tracking-wide mb-0.5">Série mentionnée dans cet article</div>
            <div class="text-[14px] font-bold text-white leading-tight truncate">{{ selectedSerie.titleFull || selectedSerie.title }}</div>
            <div class="flex items-center gap-2 text-[11px] text-ink-2 mt-0.5 flex-wrap">
              <span v-if="selectedSerie.score" class="font-extrabold text-orange">⭐ {{ selectedSerie.score }}</span>
              <span v-if="selectedSerie.score" class="text-ink-3">·</span>
              <span>{{ selectedSerie.year }}{{ selectedSerie.studio ? ` · ${selectedSerie.studio}` : '' }}</span>
            </div>
            <div class="flex gap-1 mt-1.5 flex-wrap">
              <span v-for="g in (selectedSerie.genres || []).slice(0, 3)" :key="g" class="tag text-[10px] py-0.5 px-2">{{ g }}</span>
            </div>
          </div>
          <svg class="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <!-- Épisodes liés -->
        <div v-if="previewEpisodes.length">
          <div class="text-[11px] font-bold text-white mb-2">
            {{ previewEpisodes.length > 1 ? 'Épisodes mentionnés' : 'Épisode mentionné' }}
            <span class="text-ink-3 font-normal"> — {{ selectedSerie?.title }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <div v-for="ep in previewEpisodes" :key="ep.num" class="flex items-center gap-3 bg-bg-1 border border-white/[0.06] rounded-xl p-2.5">
              <!-- Thumbnail -->
              <div class="w-20 h-12 rounded-lg shrink-0 overflow-hidden relative bg-bg-2">
                <img loading="lazy" v-if="ep.thumbnail" :src="ep.thumbnail" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-[10px] font-bold text-ink-3">EP {{ ep.num }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-bold text-white">
                  Épisode {{ ep.num }}<span v-if="ep.title"> — {{ ep.title }}</span>
                </div>
                <div v-if="ep.airDate" class="text-[10px] text-ink-3 mt-0.5">{{ ep.airDate }}</div>
              </div>
              <div class="flex gap-1.5 shrink-0">
                <span class="text-[9px] font-bold px-2 py-1 rounded-md bg-bg-3 border border-white/10 text-ink-3">VOSTFR</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { http } from '@/services/http.js'

const BASE   = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const route  = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

// ── Icon picker ──────────────────────────────────────────────────
const iconPickerOpen = ref(false)
const iconPickerRef  = ref(null)
const iconCategories = [
  { label: 'Actualités',  icons: ['📰','🗞️','📢','📣','🔔','📯','🗣️','💬','📨','✉️'] },
  { label: 'Épisodes',    icons: ['🎬','🎥','📺','🎞️','▶️','⏭️','🎭','🍿','🎙️','🎵'] },
  { label: 'Tech',        icons: ['🔄','⚡','🛠️','🔧','⚙️','🖥️','💾','🔌','🚀','📡'] },
  { label: 'Équipe',      icons: ['👥','🤝','✋','📝','🖊️','✏️','📋','🏷️','🎓','💼'] },
  { label: 'Événements',  icons: ['🎉','🎊','🎈','🏆','🥇','🎯','🌟','⭐','✨','💫'] },
  { label: 'Divers',      icons: ['🔥','💥','❤️','💙','💜','🖤','🌙','☀️','🌈','🎁','🎗️','💎','👑','🦊','🐉'] },
]
function selectIcon(ico) { form.value.icon = ico; iconPickerOpen.value = false }

// ── Gradient ─────────────────────────────────────────────────────
const gradStops = ref(['#0d0d1a', '#1a1030', '#0a0816'])
const gradAngle = ref(155)
function setGradStop(i, val) { gradStops.value[i] = val; buildGradient() }
function buildGradient() { form.value.gradient = `linear-gradient(${gradAngle.value}deg,${gradStops.value.join(',')})` }
function parseGradient() {
  const str = form.value.gradient || ''
  const am = str.match(/(\d+)deg/)
  if (am) gradAngle.value = parseInt(am[1])
  const colors = [...str.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => {
    const h = m[1]; return h.length === 3 ? '#' + h.split('').map(c => c + c).join('') : '#' + h
  })
  if (colors[0]) gradStops.value[0] = colors[0]
  if (colors[1]) gradStops.value[1] = colors[1]
  if (colors[2]) gradStops.value[2] = colors[2]
}
function resetGradient() { gradStops.value = ['#0d0d1a', '#1a1030', '#0a0816']; gradAngle.value = 155; buildGradient() }

// ── Rich editor ──────────────────────────────────────────────────
const editorEl     = ref(null)
const fmtDropOpen  = ref(false)
const sizeDropOpen = ref(false)
const colorDropOpen = ref(false)
const selectedColor = ref('#ffffff')
const currentBlockLabel = ref('Paragraphe')
const currentFontSize   = ref('14px')

const fmt = reactive({
  bold: false, italic: false, underline: false, strikeThrough: false,
  justifyLeft: false, justifyCenter: false, justifyRight: false,
  unorderedList: false, orderedList: false,
})

const fontSizes = [
  { val: '1', label: 'Très petit', px: '10px' },
  { val: '2', label: 'Petit',      px: '12px' },
  { val: '3', label: 'Normal',     px: '14px' },
  { val: '4', label: 'Grand',      px: '16px' },
  { val: '5', label: 'Très grand', px: '20px' },
  { val: '6', label: 'Énorme',     px: '24px' },
]
const blockLabels = { p: 'Paragraphe', h2: 'Titre', h3: 'Sous-titre', h4: 'Petit titre', blockquote: 'Citation' }

const textColors = [
  { val: '#ffffff', name: 'Blanc' },      { val: '#a0a0b8', name: 'Gris clair' },
  { val: '#6b6b80', name: 'Gris' },       { val: '#ff6b35', name: 'Orange' },
  { val: '#f59e0b', name: 'Ambre' },      { val: '#facc15', name: 'Jaune' },
  { val: '#4ade80', name: 'Vert' },       { val: '#34d399', name: 'Émeraude' },
  { val: '#60a5fa', name: 'Bleu' },       { val: '#818cf8', name: 'Indigo' },
  { val: '#c084fc', name: 'Violet' },     { val: '#f472b6', name: 'Rose' },
  { val: '#fb7185', name: 'Rouge rosé' }, { val: '#f87171', name: 'Rouge' },
  { val: '#fbbf24', name: 'Or' },         { val: '#2dd4bf', name: 'Cyan' },
  { val: '#38bdf8', name: 'Ciel' },       { val: '#a78bfa', name: 'Lavande' },
  { val: '#e879f9', name: 'Fuchsia' },    { val: '#94a3b8', name: 'Ardoise' },
]

function exec(cmd, value) {
  editorEl.value?.focus()
  document.execCommand(cmd, false, value ?? null)
  onEditorInput(); updateFmt()
}
function applyBlock(tag) {
  fmtDropOpen.value = false
  editorEl.value?.focus()
  document.execCommand('formatBlock', false, `<${tag}>`)
  onEditorInput(); updateFmt()
}
function applyFontSize(val) {
  sizeDropOpen.value = false
  editorEl.value?.focus()
  document.execCommand('fontSize', false, val)
  const pxMap = { '1':'10px','2':'12px','3':'14px','4':'16px','5':'20px','6':'24px' }
  currentFontSize.value = pxMap[val] ?? '14px'
  onEditorInput()
}
function applyColor(val) {
  colorDropOpen.value = false
  selectedColor.value = val === 'inherit' ? '#ffffff' : val
  editorEl.value?.focus()
  document.execCommand('foreColor', false, val)
  onEditorInput()
}
function insertHR() { editorEl.value?.focus(); document.execCommand('insertHTML', false, '<hr/><p><br></p>'); onEditorInput() }
function insertLink() {
  const url = prompt('URL du lien :'); if (!url) return
  editorEl.value?.focus()
  document.execCommand('createLink', false, url)
  const sel = window.getSelection()
  if (sel?.anchorNode?.parentElement?.tagName === 'A') {
    sel.anchorNode.parentElement.target = '_blank'
    sel.anchorNode.parentElement.rel = 'noopener'
  }
  onEditorInput()
}
function updateFmt() {
  try {
    fmt.bold          = document.queryCommandState('bold')
    fmt.italic        = document.queryCommandState('italic')
    fmt.underline     = document.queryCommandState('underline')
    fmt.strikeThrough = document.queryCommandState('strikeThrough')
    fmt.justifyLeft   = document.queryCommandState('justifyLeft')
    fmt.justifyCenter = document.queryCommandState('justifyCenter')
    fmt.justifyRight  = document.queryCommandState('justifyRight')
    fmt.unorderedList = document.queryCommandState('insertUnorderedList')
    fmt.orderedList   = document.queryCommandState('insertOrderedList')
    const block = document.queryCommandValue('formatBlock').toLowerCase()
    currentBlockLabel.value = blockLabels[block] ?? 'Paragraphe'
  } catch {}
}
function onEditorInput() {
  form.value.contentHtml = editorEl.value?.innerHTML ?? ''
  if (!form.value.excerpt) autoExcerpt()
}
function excerptFromHtml(html, n = 40) {
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim()
  const words = text.split(' ').filter(w => w)
  return words.length > n ? words.slice(0, n).join(' ') + '…' : words.join(' ')
}
function autoExcerpt() { form.value.excerpt = excerptFromHtml(form.value.contentHtml) }

// ── Données / série ───────────────────────────────────────────────
const allSeries       = ref([])
const serieSearch     = ref('')
const serieDropdownOpen = ref(false)

const filteredSeries = computed(() => {
  const q = serieSearch.value.trim().toLowerCase()
  if (!q) return allSeries.value.slice(0, 12)
  return allSeries.value.filter(s => s.title.toLowerCase().includes(q) || s.titleFull?.toLowerCase().includes(q)).slice(0, 12)
})
const selectedSerie = computed(() => allSeries.value.find(s => s.id === form.value.serieId) ?? null)
const availableEpisodes = computed(() => {
  const s = selectedSerie.value; if (!s) return []
  const eps = s.seasons?.flatMap(ss => ss.episodes ?? []) ?? []
  return [...eps, ...(s.episodes ?? [])].sort((a, b) => a.num - b.num)
})

const previewEpisodes = computed(() =>
  availableEpisodes.value.filter(ep => form.value.episodeNums.includes(ep.num))
)
function selectSerie(s) { form.value.serieId = s.id; form.value.episodeNums = []; serieSearch.value = s.title; serieDropdownOpen.value = false }
function clearSerie()   { form.value.serieId = null; form.value.episodeNums = []; serieSearch.value = '' }
function toggleEpisode(num) { const i = form.value.episodeNums.indexOf(num); i === -1 ? form.value.episodeNums.push(num) : form.value.episodeNums.splice(i, 1) }

// ── Formulaire ───────────────────────────────────────────────────
const saving    = ref(false)
const formError = ref('')
const form = ref({
  title: '', category: '', icon: '📰',
  thumb: '', gradient: '', excerpt: '', contentHtml: '',
  heroSource: 'custom',
  published: true,
  serieId: null, episodeNums: [],
})

onMounted(async () => {
  const [s] = await Promise.all([http.get('/series').catch(() => [])])
  allSeries.value = s

  if (isEdit.value) {
    try {
      const a = await http.get(`/news/${route.params.id}`)
      form.value = {
        title:       a.title       ?? '',
        category:    a.category    ?? '',
        icon:        a.icon        ?? '📰',
        thumb:       a.thumb       ?? '',
        gradient:    a.gradient    ?? '',
        excerpt:     a.excerpt     ?? '',
        contentHtml: a.contentHtml ?? (a.content?.length ? a.content.map(p => `<p>${p}</p>`).join('') : ''),
        heroSource:  a.heroSource  ?? 'custom',
        published:   a.published   ?? true,
        serieId:     a.serieId     ?? null,
        episodeNums: a.episodeNums ? [...a.episodeNums] : [],
      }
      serieSearch.value = selectedSerie.value?.title ?? ''
      parseGradient()
    } catch { router.push('/admin/news') }
  } else {
    resetGradient()
  }

  nextTick(() => {
    if (editorEl.value) editorEl.value.innerHTML = form.value.contentHtml || '<p><br></p>'
  })

  document.addEventListener('mousedown', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
function onDocClick(e) {
  if (iconPickerRef.value && !iconPickerRef.value.contains(e.target)) iconPickerOpen.value = false
}

async function submitSave() {
  formError.value = ''
  if (!form.value.title.trim())    { formError.value = 'Le titre est requis.';      return }
  if (!form.value.category.trim()) { formError.value = 'La catégorie est requise.'; return }
  if (!form.value.excerpt.trim()) autoExcerpt()

  saving.value = true
  try {
    if (isEdit.value) {
      await http.put(`/news/${route.params.id}`, form.value)
    } else {
      await http.post('/news', form.value)
    }
    router.push('/admin/news')
  } catch (e) {
    formError.value = e.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}

// ── Upload image ─────────────────────────────────────────────────
const uploading   = ref(false)
const uploadError = ref('')
async function onFileChange(e) {
  const file = e.target.files[0]; if (!file) return
  uploading.value = true; uploadError.value = ''
  try {
    const fd = new FormData(); fd.append('image', file)
    const token = localStorage.getItem('fansub_jwt')
    const res = await fetch(`${BASE}/uploads/news`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur upload')
    form.value.thumb = data.url
  } catch (err) { uploadError.value = err.message }
  finally { uploading.value = false; e.target.value = '' }
}
</script>

<style scoped>
.field-label { @apply text-[10px] font-bold text-ink-3 uppercase tracking-widest; }
.field-input { @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors; }
select.field-input { @apply bg-bg-2; }

.tbtn    { @apply flex items-center justify-center min-w-[26px] h-[26px] px-1 rounded-md text-[12px] text-ink-2 hover:bg-white/[0.10] hover:text-white transition-colors; }
.tbtn-on { @apply bg-orange/20 text-orange; }
.tbsep   { @apply w-px h-4 bg-white/[0.1] mx-0.5 shrink-0; }
.fmtopt  { @apply block w-full px-4 py-1.5 text-left text-white hover:bg-white/[0.07] transition-colors; }

.editor-body :deep(h2)         { @apply text-[18px] font-extrabold text-white mt-3 mb-1; }
.editor-body :deep(h3)         { @apply text-[15px] font-bold text-white mt-2 mb-1; }
.editor-body :deep(h4)         { @apply text-[13px] font-semibold text-white mt-2 mb-1; }
.editor-body :deep(p)          { @apply text-[13px] text-ink-2 leading-relaxed min-h-[1.4em]; }
.editor-body :deep(ul)         { @apply list-disc pl-5 text-[13px] text-ink-2; }
.editor-body :deep(ol)         { @apply list-decimal pl-5 text-[13px] text-ink-2; }
.editor-body :deep(blockquote) { @apply border-l-2 border-orange/60 pl-3 italic text-ink-3 text-[13px] my-1; }
.editor-body :deep(hr)         { @apply border-none border-t border-white/10 my-3; }
.editor-body :deep(a)          { @apply text-orange underline; }
.editor-body :deep(strong)     { @apply font-bold text-white; }
.editor-body :deep(em)         { @apply italic; }
</style>
