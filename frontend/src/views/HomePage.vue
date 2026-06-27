<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="min-h-[380px] flex items-center justify-center">
      <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- ═══════════════════════ GUNDAM LAYOUT ════════════════════════ -->
    <template v-else-if="layout === 'gundam'">

      <!-- Bandeau de page -->
      <div class="gh-page-label">
        ▶ MODULE · ACCUEIL / CATALOGUE EN VEDETTE
      </div>

      <!-- Hero -->
      <div v-if="featuredSerie" class="gh-hero">
        <!-- Image de fond de la série -->
        <Transition name="hero-fade">
          <img
            loading="lazy"
            :key="featuredSerie.id"
            :src="featuredSerie.banner"
            :alt="featuredSerie.titleFull"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </Transition>
        <!-- Overlay sombre pour garder le look Gundam -->
        <div class="absolute inset-0" style="background: rgba(4,7,15,0.72)"></div>
        <div class="gh-hero-hex" aria-hidden="true"></div>
        <!-- HUD corners -->
        <div class="gh-hud gh-hud-tl" aria-hidden="true"></div>
        <div class="gh-hud gh-hud-tr" aria-hidden="true"></div>
        <div class="gh-hud gh-hud-bl" aria-hidden="true"></div>
        <div class="gh-hud gh-hud-br" aria-hidden="true"></div>
        <!-- Ligne scan verticale -->
        <div class="gh-scan-v" aria-hidden="true"></div>

        <Transition name="hero-fade" mode="out-in">
          <div :key="featuredSerie.id" class="gh-hero-inner">
            <!-- Contenu gauche -->
            <div class="gh-hero-content">
              <div class="gh-eyebrow">
                <span class="gh-eyebrow-line"></span>
                // SIMULCAST EN COURS
              </div>
              <h1 class="gh-hero-title">{{ featuredSerie.titleFull }}</h1>
              <p class="gh-hero-sub">{{ featuredSerie.titleJp }} — {{ featuredSerie.season }}</p>

              <!-- Méta -->
              <div class="gh-hero-meta">
                <div class="gh-meta">
                  <span class="gh-meta-label">Score</span>
                  <span class="gh-meta-value">⭐ {{ featuredSerie.score }}</span>
                </div>
                <div class="gh-meta">
                  <span class="gh-meta-label">Année</span>
                  <span class="gh-meta-value">{{ featuredSerie.year }}</span>
                </div>
                <div class="gh-meta">
                  <span class="gh-meta-label">Studio</span>
                  <span class="gh-meta-value">{{ featuredSerie.studio }}</span>
                </div>
                <div class="gh-meta">
                  <span class="gh-meta-label">Épisode</span>
                  <span class="gh-meta-value">EP {{ featuredItem.episode.num }}</span>
                </div>
              </div>

              <!-- Barre de traduction -->
              <div class="gh-energy">
                <div class="gh-energy-label-top">Progression traduction</div>
                <div class="gh-energy-track">
                  <div class="gh-energy-fill" :style="{ width: featuredItem.translation.pct + '%' }"></div>
                </div>
                <div class="gh-energy-label">AVANCEMENT · {{ featuredItem.translation.pct }}% — {{ currentStep }}</div>
              </div>

              <!-- CTA -->
              <div class="gh-hero-btns">
                <button
                  @click="toggleFavorite(featuredSerie.id)"
                  class="btn-primary text-[11px]"
                >
                  <svg class="w-3.5 h-3.5" :class="isFavorite(featuredSerie.id) ? 'fill-white stroke-white' : 'fill-none stroke-current'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ isFavorite(featuredSerie.id) ? 'Dans ma liste' : '+ Ma liste' }}
                </button>
                <RouterLink :to="`/serie/${featuredSerie.id}`" class="btn-outline text-[11px]">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Détails
                </RouterLink>
              </div>
            </div>

            <!-- Panel étapes (droite) -->
            <div class="gh-steps-panel">
              <div class="gh-steps-ep">EP {{ featuredItem.episode.num }} — {{ featuredItem.episode.title }}</div>
              <div class="flex flex-col gap-2 mt-3">
                <div v-for="step in featuredItem.translation.steps" :key="step.label" class="gh-step">
                  <div class="gh-step-dot" :class="step.done ? 'gh-step-done' : step.current ? 'gh-step-active' : ''"></div>
                  <span class="gh-step-label" :class="step.done ? 'line-through text-ink-3' : step.current ? 'text-white font-bold' : 'text-ink-3'">{{ step.label }}</span>
                  <span v-if="step.current && featuredItem.staff?.translator" class="ml-auto text-[9px] text-ink-3 truncate max-w-[70px] font-mono">{{ featuredItem.staff.translator }}</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Navigation carrousel style scan -->
        <div class="gh-hero-nav">
          <button
            v-for="(item, i) in carouselItems"
            :key="item.serieId"
            class="gh-dot"
            :class="i === currentSlide ? 'gh-dot-active' : ''"
            :aria-label="`Voir ${item.serie.titleFull}`"
            @click="goToSlide(i)"
          >
            <span
              v-if="i === currentSlide"
              class="gh-dot-fill hero-progress-fill"
              :style="{ animationDuration: SLIDE_DURATION + 'ms' }"
              @animationend="nextSlide"
            ></span>
          </button>
        </div>

        <div class="gh-hero-bottom-border"></div>
      </div>

      <!-- Grid principale -->
      <div class="gh-layout">

        <!-- Colonne gauche -->
        <div class="gh-main">

          <!-- Actualités -->
          <div v-if="news.length">
            <div class="gh-section-head">
              <div class="gh-section-mark"></div>
              <span class="section-title">Actualités</span>
              <RouterLink to="/actualites" class="gh-section-link">Voir tout →</RouterLink>
            </div>
            <div class="flex flex-col gap-2">
              <RouterLink
                v-for="item in news"
                :key="item._id"
                :to="`/actualite/${item._id}`"
                class="flex items-start gap-3 bg-bg-1/60 px-3 py-2.5 transition-all"
                :class="liveNews.some(n => String(n._id) === String(item._id))
                  ? 'border border-orange/[0.1] border-l-[3px] border-l-orange/70 hover:bg-orange/[0.05] hover:border-orange/25 hover:border-l-orange'
                  : 'border border-orange/[0.1] border-l-[3px] border-l-orange/20 hover:bg-orange/[0.05] hover:border-orange/25 hover:border-l-orange'"
              >
                <!-- Miniature -->
                <div class="w-20 h-12 shrink-0 relative border-l-2 border-orange/35 overflow-hidden" :style="{ background: item.gradient || '#1a1a2a' }">
                  <img loading="lazy" v-if="item.thumb" :src="item.thumb" class="absolute inset-0 w-full h-full object-cover opacity-75" />
                  <div v-if="!item.thumb" class="absolute inset-0 flex items-center justify-center text-2xl opacity-30">{{ item.icon }}</div>
                </div>
                <!-- Infos -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="badge" :class="getCategoryBadge(item.category)">{{ item.category }}</span>
                    <span class="text-[9px] text-ink-3 font-mono">{{ formatNewsDate(item.createdAt) }}</span>
                  </div>
                  <div class="text-[12px] font-bold text-ink-1 truncate mb-0.5">{{ item.title }}</div>
                  <div class="text-[11px] text-ink-3 line-clamp-2 leading-relaxed">{{ item.excerpt }}</div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Continuer à regarder -->
          <div v-if="continueWatching.length">
            <div class="gh-section-head">
              <div class="gh-section-mark"></div>
              <span class="section-title">Continuer à regarder</span>
              <RouterLink to="/profil?tab=activity" class="gh-section-link">Voir tout →</RouterLink>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
              <RouterLink
                v-for="item in continueWatching"
                :key="`cw-${item.serieId}-${item.seasonSlug}-${item.epNum}`"
                :to="item.url"
                class="gh-poster-card"
              >
                <div class="aspect-[2/3] relative bg-bg-2 overflow-hidden">
                  <img loading="lazy" :src="item.episode.thumbnail || item.serie.poster" :alt="item.serie.title" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                  <div class="absolute bottom-1.5 right-1.5 font-mono text-[9px] font-bold bg-black/75 px-1.5 py-px text-orange">
                    EP{{ String(item.epNum).padStart(2, '0') }}
                  </div>
                  <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                    <div class="h-full bg-orange" :style="{ width: item.pct + '%' }"></div>
                  </div>
                </div>
                <div class="p-2 flex flex-col gap-1">
                  <div class="text-[11px] font-bold text-ink-1 leading-tight line-clamp-2">{{ item.serie.title }}</div>
                  <div class="text-[9px] text-ink-3 font-mono truncate">{{ item.pct }}% visionné</div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Dernières sorties — grille de posters -->
          <div>
            <div class="gh-section-head">
              <div class="gh-section-mark"></div>
              <span class="section-title">Dernières sorties</span>
              <RouterLink to="/sorties" class="gh-section-link">Voir tout →</RouterLink>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
              <RouterLink
                v-for="item in latestReleases"
                :key="`${item.serieId}-${item.seasonSlug}-${item.epNum}`"
                :to="`/serie/${item.serieId}?season=${item.seasonSlug}#episode-${item.epNum}`"
                class="gh-poster-card"
              >
                <div class="aspect-[2/3] relative bg-bg-2 overflow-hidden">
                  <div class="absolute inset-0 gh-poster-skeleton"></div>
                  <img
                    loading="lazy"
                    :src="item.serie.poster"
                    :alt="item.serie.title"
                    class="absolute inset-0 w-full h-full object-cover gh-poster-img"
                    @load="(e) => { e.target.classList.add('img-loaded'); e.target.previousElementSibling?.remove() }"
                  />
                  <!-- Gradient bas sombre -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                  <!-- Effet scan (visible au hover) -->
                  <div class="gh-card-scan"></div>
                  <!-- Badge NEW -->
                  <div v-if="item.isNew" class="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    <span class="badge badge-new">NEW</span>
                  </div>
                  <!-- Numéro d'épisode -->
                  <div class="absolute bottom-1.5 right-1.5 font-mono text-[9px] font-bold bg-black/75 px-1.5 py-px text-orange">
                    EP{{ String(item.epNum).padStart(2, '0') }}
                  </div>
                </div>
                <div class="p-2 flex flex-col gap-1">
                  <div class="text-[11px] font-bold text-ink-1 leading-tight line-clamp-2">{{ item.serie.title }}</div>
                  <div class="text-[9px] text-ink-3 font-mono truncate">{{ formatRelDate(item.releasedAt) }}</div>
                </div>
              </RouterLink>
            </div>
          </div>

        </div>

        <!-- Sidebar droite -->
        <div class="gh-side">

          <!-- Stats -->
          <div v-if="stats.length" class="sidebar-card">
            <div class="sidebar-card-header">Statistiques</div>
            <div class="p-3 grid grid-cols-2 gap-2">
              <div v-for="stat in stats" :key="stat.label" class="bg-bg-2 border-t border-orange/20 border border-orange/[0.07] p-2.5 text-center">
                <div class="text-[22px] font-black text-orange leading-none">{{ stat.value }}</div>
                <div class="text-[8px] font-mono uppercase tracking-wider text-ink-3 mt-1">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Équipe -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">Recrutement</div>
            <template v-if="openPositions.length">
              <div class="flex flex-col">
                <RouterLink
                  v-for="pos in openPositions.slice(0, 5)"
                  :key="pos._id"
                  to="/recrutement"
                  class="flex items-center gap-2.5 px-3 py-2.5 border-b border-orange/[0.07] last:border-0 hover:bg-orange/[0.04] transition-colors group"
                >
                  <span class="text-base leading-none shrink-0">{{ pos.icon || '🎯' }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-[11px] font-bold text-ink-1 truncate group-hover:text-white transition-colors">{{ pos.title }}</div>
                    <div v-if="pos.description" class="text-[9px] text-ink-3 font-mono truncate mt-0.5">{{ pos.description }}</div>
                  </div>
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse"></span>
                </RouterLink>
              </div>
              <div class="px-3 py-2 border-t border-orange/[0.07]">
                <RouterLink to="/recrutement" class="btn-primary text-[10px] py-1.5 w-full justify-center">
                  Postuler →
                </RouterLink>
              </div>
            </template>
            <div v-else class="p-4 flex flex-col items-center gap-2 text-center">
              <div class="text-[10px] text-ink-3 font-mono">// AUCUN RECRUTEMENT EN COURS</div>
              <RouterLink to="/equipe" class="btn-outline text-[10px] py-1.5 w-full justify-center mt-1">
                Découvrir l'équipe
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- ═══════════════════════ FLUX 2026 LAYOUT ════════════════════ -->
    <template v-else-if="layout === 'flux'">

      <!-- HERO: carrousel plein largeur -->
      <div v-if="carouselItems.length" class="fx-home-hero relative overflow-hidden">
        <!-- Image de fond -->
        <Transition name="hero-fade">
          <img loading="eager" :key="featuredSerie.id" :src="featuredSerie.banner" :alt="featuredSerie.titleFull" class="absolute inset-0 w-full h-full object-cover" style="opacity:0.45" />
        </Transition>
        <!-- Overlay couleur de la série -->
        <Transition name="hero-fade">
          <div :key="'ov-'+featuredSerie.id" class="absolute inset-0" :style="{ background: featuredSerie.gradient, opacity: 0.3 }"></div>
        </Transition>
        <!-- Dégradé vers le bas -->
        <div class="absolute inset-0" style="background:linear-gradient(to top,#07060f 0%,rgba(7,6,15,0.65) 35%,transparent 100%)"></div>
        <!-- Grain -->
        <div class="absolute inset-0 pointer-events-none" style="background-image:radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:18px 18px;"></div>

        <!-- Contenu -->
        <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10 pt-12 flex items-end gap-8">
          <Transition name="hero-fade" mode="out-in">
            <div :key="featuredSerie.id" class="flex flex-1 items-end justify-between gap-8">
              <!-- Infos série (gauche) -->
              <div class="flex-1 max-w-lg">
                <div class="fx-eyebrow mb-4">
                  <span class="fx-eyebrow-dot"></span>
                  ◆ SIMULCAST EN COURS
                </div>
                <h1 class="fx-hero-title mb-2">{{ featuredSerie.titleFull }}</h1>
                <p class="fx-hero-sub mb-4">{{ featuredSerie.titleJp }} — {{ featuredSerie.season }}</p>

                <div class="flex items-center gap-3 flex-wrap mb-5">
                  <span class="fx-score">⭐ {{ featuredSerie.score }}</span>
                  <span class="fx-sep">·</span>
                  <span class="fx-meta-text">{{ featuredSerie.year }} · {{ featuredSerie.studio }}</span>
                  <span class="fx-sep">·</span>
                  <div class="flex gap-1.5 flex-wrap">
                    <span v-for="g in featuredSerie.genres.slice(0, 3)" :key="g" class="fx-genre-tag">{{ g }}</span>
                  </div>
                </div>

                <div class="mb-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="fx-prog-label">EP {{ featuredItem.episode.num }} · {{ featuredItem.episode.lang?.toUpperCase() }}</span>
                    <span class="fx-prog-pct">{{ featuredItem.translation.pct }}%</span>
                  </div>
                  <div class="fx-prog-track">
                    <div class="fx-prog-fill" :style="{ width: featuredItem.translation.pct + '%' }"></div>
                  </div>
                  <div v-if="featuredItem.translation.eta" class="fx-prog-eta">
                    Sortie estimée · <span>{{ featuredItem.translation.eta }}</span>
                  </div>
                </div>

                <div class="flex gap-2 flex-wrap">
                  <button @click="toggleFavorite(featuredSerie.id)" class="fx-cta-primary">
                    <svg class="w-4 h-4" :class="isFavorite(featuredSerie.id) ? 'fill-white stroke-white' : 'fill-none stroke-current'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ isFavorite(featuredSerie.id) ? 'Dans ma liste' : 'Ajouter à ma liste' }}
                  </button>
                  <RouterLink :to="`/serie/${featuredSerie.id}`" class="fx-cta-ghost">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Détails
                  </RouterLink>
                </div>
              </div>

              <!-- Panneau étapes (droite collée) -->
              <div class="hidden md:block fx-steps-panel">
                <div class="fx-steps-ep-label">Épisode {{ featuredItem.episode.num }}</div>
                <div class="fx-steps-ep-title">{{ featuredItem.episode.title }}</div>
                <div class="flex flex-col gap-2.5 mt-4">
                  <div v-for="step in featuredItem.translation.steps" :key="step.label" class="flex items-center gap-2.5">
                    <div class="fx-step-dot" :class="step.done ? 'fx-step-done' : step.current ? 'fx-step-active' : ''">
                      <svg v-if="step.done" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      <span v-else-if="step.current" class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse block"></span>
                    </div>
                    <span class="fx-step-label" :class="step.done ? 'line-through opacity-35' : step.current ? '!text-white font-semibold' : ''">{{ step.label }}</span>
                    <span v-if="step.current && featuredItem.staff?.translator" class="ml-auto text-[9px] opacity-30 truncate max-w-[70px]">{{ featuredItem.staff.translator }}</span>
                  </div>
                </div>
              </div>

            </div>
          </Transition>
        </div>

        <!-- Points carrousel -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          <button
            v-for="(item, i) in carouselItems" :key="item.serieId"
            class="relative h-1.5 rounded-full overflow-hidden transition-[width] duration-300"
            :class="i === currentSlide ? 'w-10 fx-dot-active' : 'w-1.5 fx-dot'"
            @click="goToSlide(i)"
          >
            <span v-if="i === currentSlide" :key="currentSlide" class="absolute inset-y-0 left-0 rounded-full fx-dot-fill hero-progress-fill" :style="{ animationDuration: SLIDE_DURATION + 'ms' }" @animationend="nextSlide"></span>
          </button>
        </div>
      </div>

      <!-- HOME LAYOUT -->
      <div class="max-w-6xl mx-auto px-6 pb-16">

        <!-- Actualités (bento) + Sidebar -->
        <div class="fx-two-col pt-8 pb-6">

          <!-- Actualités: style bento -->
          <section>
            <div class="fx-section-head">
              <div class="fx-section-ttl">Actualités</div>
              <RouterLink to="/actualites" class="fx-section-lnk">Voir tout →</RouterLink>
            </div>
            <div class="fx-bento2">
              <RouterLink
                v-for="(item, i) in news"
                :key="item._id"
                :to="`/actualite/${item._id}`"
                class="fx-card2" :class="i === 0 ? 'fx-card2-featured' : ''"
              >
                <div class="fx-card2-img">
                  <img loading="lazy" v-if="item.thumb || item.serie?.banner || item.serie?.poster" :src="item.thumb || item.serie?.banner || item.serie?.poster" class="absolute inset-0 w-full h-full object-cover" />
                  <div v-if="!item.thumb && !item.serie?.banner && !item.serie?.poster" class="absolute inset-0" :style="{ background: item.gradient || item.serie?.gradient || 'rgba(168,85,247,0.2)' }"></div>
                  <div v-if="i === 0 && item.icon" class="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style="font-size:100px;opacity:0.07;filter:blur(2px)">{{ item.icon }}</div>
                  <div class="fx-card2-grad"></div>
                  <div class="fx-card2-scan"></div>
                  <span class="badge absolute top-2 left-2" :class="getCategoryBadge(item.category)">{{ item.category }}</span>
                </div>
                <div class="fx-card2-foot">
                  <div class="fx-card2-ttl">{{ item.title }}</div>
                  <div v-if="i === 0" class="fx-card2-excerpt">{{ item.excerpt || 'Découvrez les dernières nouvelles et mises à jour de la plateforme.' }}</div>
                  <div class="fx-card2-meta">
                    <span class="fx-card2-date">{{ formatNewsDate(item.createdAt) }}</span>
                    <span v-if="i === 0" class="fx-card2-read">Lire →</span>
                  </div>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- Sidebar -->
          <aside class="flex flex-col gap-4">
            <div v-if="stats.length" class="fx-panel2">
              <div class="fx-panel2-title">Statistiques</div>
              <div class="fx-stats-grid2">
                <div v-for="stat in stats" :key="stat.label" class="fx-stat-box2">
                  <div class="fx-stat-num2">{{ stat.value }}</div>
                  <div class="fx-stat-lbl2">{{ stat.label }}</div>
                </div>
              </div>
            </div>
            <div class="fx-panel2 flex flex-col gap-3">
              <div class="fx-panel2-title">Notre équipe</div>
              <div v-if="teamMembers.length" class="flex items-center gap-3">
                <div class="flex -space-x-2">
                  <div v-for="m in teamMembers.slice(0, 6)" :key="m._id"
                       class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                       style="border: 2px solid rgba(255,255,255,0.06)"
                       :style="{ background: m.avatarGradient || '#334155' }" :title="m.name">
                    {{ m.initials || m.name?.[0]?.toUpperCase() }}
                  </div>
                </div>
                <span class="text-[11px]" style="color:rgba(245,242,255,0.4)"><span style="color:rgba(245,242,255,0.9);font-weight:600">{{ teamMembers.length }}</span> membres</span>
              </div>
              <template v-if="openPositions.length">
                <div class="h-px" style="background:rgba(255,255,255,0.06)"></div>
                <div class="flex flex-col gap-1.5">
                  <div v-for="pos in openPositions.slice(0, 3)" :key="pos._id" class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
                    <span class="text-base leading-none shrink-0">{{ pos.icon || '🎯' }}</span>
                    <span class="text-[11px] truncate" style="color:rgba(245,242,255,0.7)">{{ pos.title }}</span>
                    <span class="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse"></span>
                  </div>
                </div>
                <RouterLink to="/recrutement" class="fx-btn fx-btn-primary-h w-full justify-center" style="font-size:11px;padding:6px 12px">Rejoindre l'équipe</RouterLink>
              </template>
              <template v-else>
                <RouterLink to="/equipe" class="fx-btn fx-btn-glass-h w-full justify-center" style="font-size:11px;padding:6px 12px">Découvrir l'équipe</RouterLink>
              </template>
            </div>
          </aside>
        </div>

        <!-- Continuer à regarder -->
        <section v-if="continueWatching.length" class="pt-2 pb-6">
          <div class="fx-section-head">
            <div class="fx-section-ttl">Continuer à regarder</div>
            <RouterLink to="/profil?tab=activity" class="fx-section-lnk">Voir tout →</RouterLink>
          </div>
          <div class="fx-releases-grid">
            <RouterLink
              v-for="item in continueWatching"
              :key="`cw-${item.serieId}-${item.seasonSlug}-${item.epNum}`"
              :to="item.url"
              class="fx-poster-card"
            >
              <div class="fx-poster-thumb aspect-[2/3] relative overflow-hidden rounded-xl">
                <img loading="lazy" :src="item.episode.thumbnail || item.serie.poster" :alt="item.serie.title" class="fx-poster-img absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(7,6,15,0.95) 0%,transparent 55%)"></div>
                <div class="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-px rounded-md" style="background:rgba(168,85,247,0.25);color:#c084fc;border:1px solid rgba(192,132,252,0.3)">EP{{ String(item.epNum).padStart(2,'0') }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-1" style="background:rgba(0,0,0,0.5)">
                  <div class="h-full" :style="{ background: 'linear-gradient(90deg,#a855f7,#22d3ee)', width: item.pct + '%' }"></div>
                </div>
              </div>
              <div class="pt-2 px-0.5">
                <div class="text-[11px] font-semibold leading-tight line-clamp-2 mb-1" style="color:rgba(245,242,255,0.8)">{{ item.serie.title }}</div>
                <div class="text-[9px]" style="color:rgba(245,242,255,0.3)">{{ item.pct }}% visionné</div>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Séparateur -->
        <div class="h-px my-2" style="background:linear-gradient(90deg,transparent,rgba(192,132,252,0.18),rgba(34,211,238,0.18),transparent)"></div>

        <!-- Dernières sorties: poster grid (comme autres thèmes) -->
        <section class="pt-6 pb-8">
          <div class="fx-section-head">
            <div class="fx-section-ttl">Dernières sorties</div>
            <RouterLink to="/sorties" class="fx-section-lnk">Voir tout →</RouterLink>
          </div>
          <div class="fx-releases-grid">
            <RouterLink
              v-for="item in latestReleases"
              :key="`${item.serieId}-${item.seasonSlug}-${item.epNum}`"
              :to="`/serie/${item.serieId}?season=${item.seasonSlug}#episode-${item.epNum}`"
              class="fx-poster-card"
            >
              <div class="fx-poster-thumb aspect-[2/3] relative overflow-hidden rounded-xl">
                <img loading="lazy" :src="item.serie.poster" :alt="item.serie.title" class="fx-poster-img absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(7,6,15,0.95) 0%,transparent 55%)"></div>
                <span v-if="item.isNew" class="absolute top-2 left-2 badge badge-new">NEW</span>
                <div class="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-px rounded-md" style="background:rgba(168,85,247,0.25);color:#c084fc;border:1px solid rgba(192,132,252,0.3)">EP{{ String(item.epNum).padStart(2,'0') }}</div>
              </div>
              <div class="pt-2 px-0.5">
                <div class="text-[11px] font-semibold leading-tight line-clamp-2 mb-1" style="color:rgba(245,242,255,0.8)">{{ item.serie.title }}</div>
                <div class="text-[9px]" style="color:rgba(245,242,255,0.3)">{{ formatRelDate(item.releasedAt) }}</div>
              </div>
            </RouterLink>
          </div>
        </section>

      </div>
    </template>

    <!-- ═══════════════════════ DEFAULT LAYOUT ═══════════════════════ -->
    <template v-else>

      <!-- HERO SECTION : carrousel des simulcasts en cours -->
      <div v-if="carouselItems.length" class="relative min-h-[380px] flex items-end overflow-hidden">
        <!-- Image de fond (fondu entre les séries) -->
        <Transition name="hero-fade">
          <img loading="lazy"
            :key="featuredSerie.id"
            :src="featuredSerie.banner"
            :alt="featuredSerie.titleFull"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </Transition>
        <!-- Teinte aux couleurs du thème (intensité réglable depuis le profil) -->
        <Transition name="hero-fade">
          <div :key="featuredSerie.id" class="absolute inset-0" :style="{ background: featuredSerie.gradient, opacity: overlayAlpha }"></div>
        </Transition>
        <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, transparent 55%)"></div>

        <!-- Screentone overlay -->
        <div class="absolute inset-0 opacity-[0.04]"
             style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>

        <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Transition name="hero-fade" mode="out-in">
            <div :key="featuredSerie.id" class="flex flex-col md:flex-row flex-1 md:items-end md:justify-between gap-6 w-full">
              <!-- Hero info -->
              <div class="flex-1 max-w-lg">
                <div class="flex items-center gap-2 mb-3">
                  <span class="badge badge-simulcast">En traduction</span>
                  <span class="text-[11px] text-ink-2 font-medium">{{ currentStep }}</span>
                  <span
                    v-if="settings.isAdmin && featuredItem.visible === false"
                    class="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 rounded px-1.5 py-px"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    Non visible
                  </span>
                </div>
                <h1 class="text-[24px] sm:text-[34px] font-extrabold text-white leading-tight mb-1">{{ featuredSerie.titleFull }}</h1>
                <p class="text-[13px] text-ink-2 mb-3">{{ featuredSerie.titleJp }} — {{ featuredSerie.season }}</p>

                <div class="flex items-center gap-3 text-[12px] text-ink-2 mb-3 flex-wrap">
                  <span class="text-[16px] font-extrabold text-orange">⭐ {{ featuredSerie.score }}</span>
                  <span class="text-ink-3">·</span>
                  <span>{{ featuredSerie.year }} · {{ featuredSerie.studio }}</span>
                  <span class="text-ink-3">·</span>
                  <div class="flex gap-1">
                    <span v-for="g in featuredSerie.genres.slice(0, 3)" :key="g" class="tag text-[10px] py-0.5 px-2">{{ g }}</span>
                  </div>
                </div>

                <!-- Barre de progression traduction -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[11px] font-semibold text-ink-2">
                      EP {{ featuredItem.episode.num }} · {{ featuredItem.episode.lang.toUpperCase() }}
                    </span>
                    <span class="text-[11px] font-extrabold text-orange">{{ featuredItem.translation.pct }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-orange rounded-full transition-all duration-700"
                      :style="{ width: featuredItem.translation.pct + '%' }"
                    ></div>
                  </div>
                  <div v-if="featuredItem.translation.eta" class="text-[10px] text-ink-3 mt-1">
                    Sortie estimée · <span class="text-ink-2 font-medium">{{ featuredItem.translation.eta }}</span>
                  </div>
                </div>

                <div class="flex gap-2 flex-wrap">
                  <button
                    @click="toggleFavorite(featuredSerie.id)"
                    class="gap-2 text-[13px] transition-all"
                    :class="isFavorite(featuredSerie.id) ? 'btn-primary' : 'btn-ghost'"
                  >
                    <svg
                      class="w-4 h-4 transition-all"
                      :class="isFavorite(featuredSerie.id) ? 'fill-white stroke-white' : 'fill-none stroke-current'"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ isFavorite(featuredSerie.id) ? 'Dans ma liste' : 'Ajouter à ma liste' }}
                  </button>
                  <RouterLink :to="`/serie/${featuredSerie.id}`" class="btn-ghost text-[13px]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Détails
                  </RouterLink>
                </div>
              </div>

              <!-- Carte étapes de traduction -->
              <div class="hidden md:block bg-bg-1/80 backdrop-blur border border-white/10 rounded-xl p-4 min-w-[230px]">
                <div class="text-[10px] font-bold text-orange uppercase tracking-wide mb-0.5">
                  Épisode {{ featuredItem.episode.num }}
                </div>
                <div class="text-[12px] font-semibold text-white mb-3 leading-snug">
                  {{ featuredItem.episode.title }}
                </div>

                <!-- Étapes -->
                <div class="flex flex-col gap-2">
                  <div
                    v-for="step in featuredItem.translation.steps"
                    :key="step.label"
                    class="flex items-center gap-2.5"
                  >
                    <!-- Indicateur -->
                    <div class="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      :class="step.done
                        ? 'bg-orange'
                        : step.current
                          ? 'bg-orange/30 ring-2 ring-orange/60 ring-offset-1 ring-offset-bg-1'
                          : 'bg-white/10'"
                    >
                      <svg v-if="step.done" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span v-else-if="step.current" class="w-1.5 h-1.5 rounded-full bg-orange animate-pulse block"></span>
                    </div>

                    <!-- Label -->
                    <span
                      class="text-[11px] font-medium"
                      :class="step.done ? 'text-ink-2 line-through' : step.current ? 'text-white font-bold' : 'text-ink-3'"
                    >{{ step.label }}</span>

                    <!-- Staff assigné à l'étape courante -->
                    <span v-if="step.current && featuredItem.staff.translator" class="ml-auto text-[9px] text-ink-3 truncate max-w-[70px]">
                      {{ featuredItem.staff.translator }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Puces de navigation du carrousel -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          <button
            v-for="(item, i) in carouselItems"
            :key="item.serieId"
            class="relative h-1.5 rounded-full overflow-hidden bg-white/25 transition-[width] duration-300"
            :class="i === currentSlide ? 'w-10' : 'w-1.5 hover:bg-white/45'"
            :aria-label="`Voir ${item.serie.titleFull}`"
            :aria-current="i === currentSlide"
            @click="goToSlide(i)"
          >
            <span
              v-if="i === currentSlide"
              :key="currentSlide"
              class="absolute inset-y-0 left-0 bg-orange rounded-full hero-progress-fill"
              :style="{ animationDuration: SLIDE_DURATION + 'ms' }"
              @animationend="nextSlide"
            ></span>
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="max-w-6xl mx-auto px-6">

        <!-- Actualités + Stats -->
        <div class="pt-8 pb-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">

          <!-- Actualités -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="section-title">Actualités</div>
              <RouterLink to="/actualites" class="text-[12px] font-medium text-orange flex items-center gap-1 hover:gap-2 transition-all">
                Voir tout
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 12 12"><polyline points="4.5,1.5 9,6 4.5,10.5"/></svg>
              </RouterLink>
            </div>
            <div class="flex flex-col gap-1.5">
              <RouterLink
                v-for="item in news"
                :key="item._id"
                :to="`/actualite/${item._id}`"
                class="flex items-start gap-3 bg-bg-1 border rounded-lg px-3 py-2.5 transition-all hover:bg-bg-2"
                :class="liveNews.some(n => String(n._id) === String(item._id))
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40'
                  : 'border-white/[0.06] hover:border-white/14'"
              >
                <!-- Icône -->
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 self-center" :style="{ background: item.gradient || '#1a1a2a' }">
                  {{ item.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="badge" :class="getCategoryBadge(item.category)">{{ item.category }}</span>
                    <span class="text-[10px] text-ink-3">{{ formatNewsDate(item.createdAt) }}</span>
                  </div>
                  <div class="text-[12px] font-semibold text-ink-1 mb-0.5 truncate">{{ item.title }}</div>
                  <div class="text-[11px] text-ink-3 leading-relaxed line-clamp-2">{{ item.excerpt }}</div>
                </div>

                <!-- Illustration -->
                <div class="hidden sm:block w-28 h-16 rounded-lg shrink-0 overflow-hidden relative">
                  <img loading="lazy" v-if="item.thumb" :src="item.thumb" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0" :style="{ background: item.gradient || '#1a1a2a', opacity: item.thumb ? 0.45 : 1 }"></div>
                  <div v-if="!item.thumb" class="absolute inset-0 flex items-center justify-center text-2xl opacity-50">{{ item.icon }}</div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Stats + Annonce -->
          <div class="flex flex-col gap-4">
            <!-- Stats card -->
            <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
              <div class="text-[12px] font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-2 h-2 bg-orange rounded-full inline-block"></span>
                Statistiques
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="stat in stats" :key="stat.label" class="bg-bg-2 rounded-lg p-3 text-center">
                  <div class="text-[20px] font-extrabold text-orange leading-none mb-1">{{ stat.value }}</div>
                  <div class="text-[9px] font-semibold text-ink-3 uppercase tracking-wide">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <!-- Équipe -->
            <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">

              <!-- Header -->
              <div class="flex items-center justify-between">
                <div class="text-[12px] font-bold text-white flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Notre équipe
                </div>
                <RouterLink to="/equipe" class="text-[10px] text-ink-3 hover:text-orange transition-colors">
                  Voir tout →
                </RouterLink>
              </div>

              <!-- Avatars empilés + compteur -->
              <div v-if="teamMembers.length" class="flex items-center gap-3">
                <div class="flex -space-x-2">
                  <div
                    v-for="m in teamMembers.slice(0, 6)" :key="m._id"
                    class="w-8 h-8 rounded-full border-2 border-bg-1 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    :style="{ background: m.avatarGradient || '#334155' }"
                    :title="m.name"
                  >
                    {{ m.initials || m.name?.[0]?.toUpperCase() }}
                  </div>
                  <div
                    v-if="teamMembers.length > 6"
                    class="w-8 h-8 rounded-full border-2 border-bg-1 bg-bg-3 flex items-center justify-center text-[9px] font-bold text-ink-2 shrink-0"
                  >
                    +{{ teamMembers.length - 6 }}
                  </div>
                </div>
                <div class="text-[11px] text-ink-3 leading-tight">
                  <span class="font-semibold text-white">{{ teamMembers.length }}</span> membres actifs
                </div>
              </div>

              <!-- Postes ouverts -->
              <template v-if="openPositions.length">
                <div class="h-px bg-white/[0.06]"></div>
                <div>
                  <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-2">
                    {{ openPositions.length }} poste{{ openPositions.length > 1 ? 's' : '' }} ouvert{{ openPositions.length > 1 ? 's' : '' }}
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <div
                      v-for="pos in openPositions.slice(0, 3)" :key="pos._id"
                      class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-2 border border-white/[0.05]"
                    >
                      <span class="text-base leading-none shrink-0">{{ pos.icon || '🎯' }}</span>
                      <span class="text-[11px] font-semibold text-ink-1 truncate">{{ pos.title }}</span>
                      <span class="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                    </div>
                  </div>
                </div>
                <RouterLink to="/recrutement" class="btn-outline text-[11px] py-1.5 px-3 w-full justify-center">
                  Rejoindre l'équipe
                </RouterLink>
              </template>

              <!-- Aucun poste ouvert -->
              <template v-else>
                <div class="text-[11px] text-ink-3 text-center py-1">Aucun recrutement en cours</div>
                <RouterLink to="/equipe" class="btn-outline text-[11px] py-1.5 px-3 w-full justify-center">
                  Découvrir l'équipe
                </RouterLink>
              </template>

            </div>
          </div>
        </div>

        <!-- Continuer à regarder -->
        <div v-if="continueWatching.length" class="pt-2 pb-2">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title">Continuer à regarder</div>
            <RouterLink to="/profil?tab=activity" class="text-[12px] font-medium text-orange flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 12 12"><polyline points="4.5,1.5 9,6 4.5,10.5"/></svg>
            </RouterLink>
          </div>
          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <RouterLink
              v-for="item in continueWatching"
              :key="`cw-${item.serieId}-${item.seasonSlug}-${item.epNum}`"
              :to="item.url"
              class="group"
            >
              <div class="aspect-[2/3] relative rounded-lg overflow-hidden bg-bg-2">
                <img loading="lazy" :src="item.episode.thumbnail || item.serie.poster" :alt="item.serie.title" class="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div class="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/70 text-orange px-1.5 py-px rounded">EP{{ String(item.epNum).padStart(2,'0') }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div class="h-full bg-orange" :style="{ width: item.pct + '%' }"></div>
                </div>
              </div>
              <div class="pt-2">
                <div class="text-[11px] font-semibold text-ink-1 leading-tight line-clamp-2 mb-0.5">{{ item.serie.title }}</div>
                <div class="text-[9px] text-ink-3">{{ item.pct }}% visionné</div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Séparateur -->
        <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

        <!-- Dernières sorties -->
        <div class="pt-6 pb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title">Dernières sorties</div>
            <RouterLink to="/sorties" class="text-[12px] font-medium text-orange flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 12 12"><polyline points="4.5,1.5 9,6 4.5,10.5"/></svg>
            </RouterLink>
          </div>

          <div class="sidebar-card overflow-hidden">
            <RouterLink
              v-for="item in latestReleases"
              :key="`${item.serieId}-${item.seasonSlug}-${item.epNum}`"
              :to="`/serie/${item.serieId}?season=${item.seasonSlug}#episode-${item.epNum}`"
              class="flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors group"
              :class="liveReleases.some(r => r.serieId === item.serieId && r.epNum === item.epNum) ? 'bg-emerald-500/5' : ''"
            >
              <!-- Miniature -->
              <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
                <img loading="lazy" :src="item.serie.poster" :alt="item.serie.title" class="absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0" :style="{ background: item.serie.gradient, opacity: 0.45 }"></div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                </div>
              </div>

              <!-- Infos -->
              <div class="flex-1 min-w-0">
                <div class="text-[12px] font-bold text-white truncate">{{ item.serie.title }}</div>
                <div class="text-[10px] text-ink-2 truncate">
                  EP {{ item.epNum }}
                  <span v-if="item.episode?.title && item.episode.title !== `Épisode ${item.epNum}`">
                    — {{ item.episode.title }}
                  </span>
                </div>
              </div>

              <!-- Badge + Date -->
              <div class="flex flex-col items-end gap-1 shrink-0">
                <span v-if="item.isNew" class="badge badge-new">NEW</span>
                <span class="text-[10px] text-ink-3">{{ formatRelDate(item.releasedAt) }}</span>
              </div>
            </RouterLink>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { homeService } from '@/services/homeService.js'
import { getCategoryBadge } from '@/data/news.js'
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { useSettings } from '@/composables/useSettings.js'
import { useSocket } from '@/composables/useSocket.js'
import { layout } from '@/composables/useTheme.js'
import { http } from '@/services/http.js'
import { useSeo } from '@/composables/useSeo.js'
import { useContinueWatching } from '@/composables/useContinueWatching.js'
import { config } from '@/config.js'

const { isFavorite, toggleFavorite } = useFavorites()
const { socket } = useSocket()
const { items: continueWatching } = useContinueWatching()

useSeo({
  title      : null,
  description: config.siteDescription || config.siteTagline,
  url        : config.siteUrl,
})

function calDiff(d) {
  if (!d) return 0
  const tz  = 'Europe/Paris'
  const fmt = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }
  const todayStr = new Intl.DateTimeFormat('en-CA', fmt).format(new Date())
  const dateStr  = new Intl.DateTimeFormat('en-CA', fmt).format(new Date(d))
  return Math.round((new Date(todayStr) - new Date(dateStr)) / 86400000)
}

function formatNewsDate(d) {
  if (!d) return ''
  const diff = calDiff(d)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)  return `Il y a ${diff} jours`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'Europe/Paris' })
}

function formatRelDate(d) {
  if (!d) return ''
  const diff = calDiff(d)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)  return `Il y a ${diff} jours`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })
}
const settings = useSettings()

const loading          = ref(true)
const homeData         = ref(null)
const liveReleases     = ref([])
const liveNews         = ref([])
const liveSeriesCount  = ref(0)
const teamMembers      = ref([])
const openPositions    = ref([])

function onNewNews(article) {
  liveNews.value = liveNews.value.filter(n => String(n._id) !== String(article._id))
  liveNews.value.unshift(article)
}

function onNewSeries() {
  liveSeriesCount.value += 1
}

async function onNewRelease(release) {
  try {
    const serie = await http.get(`/series/${release.serieId}`)
    const season  = serie.seasons?.find(s => s.slug === release.seasonSlug)
    const eps     = season?.episodes ?? serie.episodes ?? []
    const episode = eps.find(e => e.num === release.epNum) ?? null
    if (episode?.visible === false) return
    const item = {
      ...release,
      serie:     { id: serie.id, title: serie.title, poster: serie.poster, gradient: serie.gradient },
      episode,
      isNew: true,
    }
    const key = `${release.serieId}-${release.seasonSlug}-${release.epNum}`
    liveReleases.value = liveReleases.value.filter(
      r => `${r.serieId}-${r.seasonSlug}-${r.epNum}` !== key
    )
    liveReleases.value.unshift(item)
  } catch {}
}

onMounted(async () => {
  try {
    const [home, team, recruit] = await Promise.all([
      homeService.fetch(settings.isAdmin),
      http.get('/team'),
      http.get('/recruit'),
    ])
    homeData.value      = home
    teamMembers.value   = team.filter(m => m.department !== 'Ancien Membre')
    openPositions.value = recruit.filter(r => r.open)
  } finally {
    loading.value = false
  }
  socket.on('new:release', onNewRelease)
  socket.on('new:news', onNewNews)
  socket.on('new:series', onNewSeries)
})

onUnmounted(() => {
  socket.off('new:release', onNewRelease)
  socket.off('new:news', onNewNews)
  socket.off('new:series', onNewSeries)
})

const carouselItems  = computed(() => homeData.value?.carousel ?? [])

const latestReleases = computed(() => {
  const seen = new Set()
  return [...liveReleases.value, ...(homeData.value?.releases ?? [])]
    .filter(r => {
      if (r.episode?.visible === false) return false
      const key = `${r.serieId}-${r.seasonSlug}-${r.epNum}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
})
const news           = computed(() => {
  const seen = new Set()
  return [...liveNews.value, ...(homeData.value?.news ?? [])]
    .filter(n => {
      const key = String(n._id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 5)
})
const stats          = computed(() => homeData.value?.stats
  ? [
      { value: (homeData.value.stats.episodes || 0).toLocaleString('fr-FR'), label: 'Épisodes' },
      { value: (homeData.value.stats.series || 0) + liveSeriesCount.value,   label: 'Séries'   },
      { value: homeData.value.stats.team       || 0,                         label: 'Membres'  },
      { value: homeData.value.stats.inProgress || 0,                         label: 'En cours' },
    ]
  : []
)

const SLIDE_DURATION = 7000
const currentSlide   = ref(0)
const featuredItem   = computed(() => carouselItems.value[currentSlide.value])
const featuredSerie  = computed(() => featuredItem.value?.serie)
const currentStep    = computed(() => featuredItem.value?.translation.steps.find(s => s.current)?.label ?? 'En cours')

watch(carouselItems, items => {
  if (currentSlide.value >= items.length) {
    currentSlide.value = Math.max(0, items.length - 1)
  }
})

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length
}
function goToSlide(i) {
  currentSlide.value = i
}

const bentoGlows = [
  'radial-gradient(ellipse at 50% 110%, rgba(168,85,247,0.65) 0%, transparent 70%)',
  'radial-gradient(ellipse at 50% 110%, rgba(34,211,238,0.55) 0%, transparent 70%)',
  'radial-gradient(ellipse at 50% 110%, rgba(251,113,133,0.55) 0%, transparent 70%)',
  'radial-gradient(ellipse at 50% 110%, rgba(52,211,153,0.55) 0%, transparent 70%)',
  'radial-gradient(ellipse at 50% 110%, rgba(251,146,60,0.55) 0%, transparent 70%)',
  'radial-gradient(ellipse at 50% 110%, rgba(192,132,252,0.55) 0%, transparent 70%)',
]
function bentoGlow(i) {
  return { background: bentoGlows[i % bentoGlows.length] }
}
</script>

<style scoped>
/* ── Transitions partagées ──────────────────────────────────────── */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.2s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

.hero-progress-fill {
  width: 0%;
  animation-name: hero-progress-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes hero-progress-fill {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── GUNDAM HOME ────────────────────────────────────────────────── */

/* Bandeau page */
.gh-page-label {
  padding: 6px 24px;
  background: rgba(var(--color-orange), 0.04);
  border-bottom: 1px solid rgba(var(--color-orange), 0.1);
  font-size: 9px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--color-ink-3));
}

/* Hero */
.gh-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.gh-hero-hex {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(60deg,  rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(120deg, rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(0deg,   rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%);
  background-size: 40px 40px;
}

/* HUD corners */
.gh-hud { position: absolute; width: 20px; height: 20px; z-index: 2; }
.gh-hud-tl { top: 12px;    left: 12px;  border-top: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.gh-hud-tr { top: 12px;    right: 12px; border-top: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }
.gh-hud-bl { bottom: 12px; left: 12px;  border-bottom: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.gh-hud-br { bottom: 12px; right: 12px; border-bottom: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }

/* Ligne scan verticale */
.gh-scan-v {
  position: absolute; top: 0; bottom: 0; right: 320px; width: 1px; z-index: 1;
  background: linear-gradient(180deg, transparent, rgba(var(--color-orange), 0.4) 30%, rgba(var(--color-orange), 0.4) 70%, transparent);
}

/* Intérieur du hero */
.gh-hero-inner {
  position: relative; z-index: 2;
  width: 100%; max-width: 1280px; margin: 0 auto;
  padding: 32px 24px;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
  background: linear-gradient(90deg, rgba(4,7,15,0.95) 0%, rgba(4,7,15,0.65) 65%, transparent);
}
.gh-hero-content { flex: 1; max-width: 520px; }

/* Eyebrow */
.gh-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: 9px; font-family: 'Courier New', monospace;
  letter-spacing: 0.25em; text-transform: uppercase;
  color: rgb(var(--color-orange)); opacity: 0.85;
  margin-bottom: 10px;
}
.gh-eyebrow-line { display: block; width: 24px; height: 1px; background: rgb(var(--color-orange)); flex-shrink: 0; }

.gh-hero-title {
  font-size: 32px; font-weight: 900; letter-spacing: 0.03em;
  color: white; line-height: 1.1; margin-bottom: 5px; text-transform: uppercase;
}
.gh-hero-sub { font-size: 12px; color: rgb(var(--color-ink-2)); margin-bottom: 16px; }

/* Méta */
.gh-hero-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; }
.gh-meta { display: flex; flex-direction: column; gap: 2px; }
.gh-meta-label { font-size: 7px; letter-spacing: 0.2em; text-transform: uppercase; color: rgb(var(--color-ink-3)); font-family: 'Courier New', monospace; }
.gh-meta-value { font-size: 12px; font-weight: 700; color: rgb(var(--color-ink-1)); }

/* Barre d'énergie */
.gh-energy { margin-bottom: 20px; }
.gh-energy-label-top { font-size: 7px; letter-spacing: 0.15em; text-transform: uppercase; color: rgb(var(--color-ink-3)); font-family: 'Courier New', monospace; margin-bottom: 4px; }
.gh-energy-track { width: 180px; height: 3px; background: rgba(var(--color-orange), 0.15); position: relative; }
.gh-energy-fill  { height: 100%; background: rgb(var(--color-orange)); box-shadow: 0 0 8px rgba(var(--color-orange), 0.6); transition: width 0.7s; }
.gh-energy-label { font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(var(--color-ink-3)); font-family: 'Courier New', monospace; margin-top: 4px; }

/* Boutons hero */
.gh-hero-btns { display: flex; gap: 8px; flex-wrap: wrap; }

/* Panel étapes (droite) */
.gh-steps-panel {
  min-width: 210px;
  background: rgba(4, 7, 15, 0.88);
  border: 1px solid rgba(var(--color-orange), 0.18);
  border-top: 2px solid rgba(var(--color-orange), 0.45);
  padding: 12px 14px;
  flex-shrink: 0;
}
@media (max-width: 768px) { .gh-steps-panel { display: none; } }
.gh-steps-ep { font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.08em; color: rgb(var(--color-orange)); font-weight: 700; line-height: 1.4; }
.gh-step { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
.gh-step-dot { width: 8px; height: 8px; background: rgba(255,255,255,0.1); flex-shrink: 0; transition: background 0.15s; }
.gh-step-done   { background: rgba(var(--color-orange), 0.5) !important; }
.gh-step-active { background: rgb(var(--color-orange)) !important; box-shadow: 0 0 6px rgba(var(--color-orange), 0.6); }
.gh-step-label  { font-size: 11px; }

/* Bordure bas du hero */
.gh-hero-bottom-border {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, rgb(var(--color-orange)), rgba(var(--color-orange), 0.3) 60%, transparent);
}

/* Nav carrousel Gundam */
.gh-hero-nav {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 4px; z-index: 10;
}
.gh-dot {
  position: relative; height: 3px; width: 6px;
  background: rgba(var(--color-orange), 0.2);
  overflow: hidden; border: none; cursor: pointer; padding: 0;
  transition: width 0.3s;
}
.gh-dot-active { width: 28px; background: rgba(var(--color-orange), 0.15); }
.gh-dot-fill {
  position: absolute; inset: 0;
  background: rgb(var(--color-orange));
  width: 0%;
  animation-name: hero-progress-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

/* Grid layout */
.gh-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}
@media (max-width: 900px) {
  .gh-layout { grid-template-columns: 1fr; }
  .gh-side { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
}
@media (max-width: 600px) {
  .gh-side { grid-template-columns: 1fr; }
  .gh-layout { padding: 16px; }
}
.gh-main { display: flex; flex-direction: column; gap: 28px; }
.gh-side  { display: flex; flex-direction: column; gap: 14px; }

/* Section headers */
.gh-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.gh-section-mark { width: 3px; height: 16px; background: rgb(var(--color-orange)); box-shadow: 0 0 8px rgba(var(--color-orange), 0.5); flex-shrink: 0; }
.gh-section-id   { font-size: 8px; font-family: 'Courier New', monospace; color: rgb(var(--color-ink-3)); letter-spacing: 0.12em; margin-left: auto; }
.gh-section-link { font-size: 9px; font-family: 'Courier New', monospace; color: rgb(var(--color-orange)); letter-spacing: 0.1em; margin-left: auto; opacity: 0.7; transition: opacity 0.15s; }
.gh-section-link:hover { opacity: 1; }

/* Dernières sorties — grille de posters style preview Gundam */
.gh-poster-card {
  display: block;
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.12);
  border-top: 2px solid rgba(var(--color-orange), 0.45);
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}
.gh-poster-card:hover {
  background: rgb(var(--color-bg-2));
  border-color: rgba(var(--color-orange), 0.45);
  border-top-color: rgb(var(--color-orange));
  box-shadow: 0 0 0 1px rgba(var(--color-orange), 0.06), 0 8px 32px rgba(0,0,0,0.65), 0 0 20px rgba(var(--color-orange), 0.12);
}
/* Skeleton shimmer en attendant le chargement de l'image */
.gh-poster-skeleton {
  background: linear-gradient(
    90deg,
    rgb(var(--color-bg-2)) 25%,
    rgb(var(--color-bg-1)) 50%,
    rgb(var(--color-bg-2)) 75%
  );
  background-size: 200% 100%;
  animation: poster-shimmer 1.5s ease-in-out infinite;
  z-index: 0;
}
@keyframes poster-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .gh-poster-skeleton { animation: none; }
}
.gh-poster-img {
  z-index: 1;
  opacity: 0;
  transition: opacity 0.35s ease, transform 0.3s ease;
}
.gh-poster-img.img-loaded { opacity: 0.7; }
.gh-poster-card:hover .gh-poster-img {
  transform: scale(1.05);
}
/* Coins de ciblage au hover */
.gh-poster-card::before,
.gh-poster-card::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.2s;
}
.gh-poster-card::before {
  top: -1px; left: -1px;
  border-top: 2px solid rgb(var(--color-orange));
  border-left: 2px solid rgb(var(--color-orange));
}
.gh-poster-card::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid rgb(var(--color-orange));
  border-right: 2px solid rgb(var(--color-orange));
}
.gh-poster-card:hover::before,
.gh-poster-card:hover::after {
  opacity: 1;
}
/* Effet scan animé — bande de lumière en translateY (GPU, pas background-position) */
.gh-card-scan {
  position: absolute;
  left: 0; right: 0;
  height: 100%;
  top: -100%;
  background: linear-gradient(180deg, transparent 40%, rgba(var(--color-orange), 0.07) 50%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  animation: gh-scan-card 2s linear infinite;
}
.gh-poster-card:hover .gh-card-scan {
  opacity: 1;
}
@keyframes gh-scan-card {
  0%   { transform: translateY(0); }
  100% { transform: translateY(200%); }
}

/* ── FLUX 2026 HOME ─────────────────────────────────────────────── */

/* Bandeau strip */
.fx-label-strip {
  display: flex; align-items: center; gap: 10px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(192,132,252,0.5);
  padding: 8px 24px;
  background: rgba(168,85,247,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fx-label-strip-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(168,85,247,0.5), rgba(34,211,238,0.3), transparent);
}

/* Hero carrousel */
.fx-home-hero { min-height: 420px; display: flex; align-items: flex-end; }

.fx-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
  color: #c084fc;
}
.fx-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #c084fc;
  box-shadow: 0 0 8px rgba(192,132,252,0.9);
  animation: fx-dot-pulse 2s ease-in-out infinite; flex-shrink: 0;
}
@keyframes fx-dot-pulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.75); }
}

.fx-hero-title {
  font-size: clamp(22px, 3.5vw, 36px); font-weight: 900; line-height: 1.1;
  background: linear-gradient(135deg, #f5f2ff 0%, #c084fc 30%, #22d3ee 60%, #f5f2ff 100%);
  background-size: 300% 300%; background-clip: text; -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  animation: fx-grad-flow 6s ease infinite;
}
@keyframes fx-grad-flow {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.fx-hero-sub  { font-size: 13px; color: rgba(245,242,255,0.42); }
.fx-score     { font-size: 15px; font-weight: 800; color: #c084fc; }
.fx-sep       { color: rgba(255,255,255,0.15); }
.fx-meta-text { font-size: 12px; color: rgba(245,242,255,0.42); }
.fx-genre-tag {
  font-size: 10px; padding: 2px 8px;
  background: rgba(192,132,252,0.1); border: 1px solid rgba(192,132,252,0.22);
  border-radius: 6px; color: #c084fc;
}
.fx-prog-label { font-size: 11px; font-weight: 600; color: rgba(245,242,255,0.5); }
.fx-prog-pct   { font-size: 11px; font-weight: 800; color: #c084fc; }
.fx-prog-track { width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.fx-prog-fill  { height: 100%; background: linear-gradient(90deg, #a855f7, #22d3ee); border-radius: 99px; box-shadow: 0 0 10px rgba(168,85,247,0.5); transition: width 0.7s; }
.fx-prog-eta   { font-size: 10px; color: rgba(245,242,255,0.3); margin-top: 5px; }
.fx-prog-eta span { color: rgba(245,242,255,0.55); font-weight: 500; }

.fx-cta-primary {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 700; color: white;
  background: linear-gradient(135deg, #a855f7, #0ea5e9);
  border: none; border-radius: 12px; padding: 10px 20px;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px rgba(168,85,247,0.4);
}
.fx-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(168,85,247,0.6); }
.fx-cta-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: rgba(245,242,255,0.65);
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 10px 20px; cursor: pointer; transition: all 0.2s;
  text-decoration: none;
}
.fx-cta-ghost:hover { background: rgba(192,132,252,0.1); border-color: rgba(192,132,252,0.3); color: white; }

.fx-steps-panel {
  min-width: 220px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
  padding: 16px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  flex-shrink: 0;
}
.fx-steps-ep-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #c084fc; }
.fx-steps-ep-title { font-size: 12px; font-weight: 600; color: rgba(245,242,255,0.75); margin-top: 4px; line-height: 1.4; }
.fx-step-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fx-step-done   { background: linear-gradient(135deg, #a855f7, #22d3ee); }
.fx-step-active { background: rgba(168,85,247,0.2); box-shadow: 0 0 0 2px rgba(168,85,247,0.4); }
.fx-step-label  { font-size: 11px; color: rgba(245,242,255,0.45); }

.fx-dot        { background: rgba(255,255,255,0.15); }
.fx-dot-active { background: rgba(255,255,255,0.07); }
.fx-dot-fill   { background: linear-gradient(90deg, #a855f7, #22d3ee); }

/* Pills (bento NEW badge) */
.fx-pill        { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 99px; letter-spacing: 0.05em; }
.fx-pill-purple { background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #c084fc; }
.fx-pill-cyan   { background: rgba(34,211,238,0.12); border: 1px solid rgba(34,211,238,0.25); color: #22d3ee; }
.fx-pill-rose   { background: rgba(251,113,133,0.12); border: 1px solid rgba(251,113,133,0.25); color: #fb7185; }
.fx-pill-green  { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25); color: #34d399; }

/* Buttons */
.fx-btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; }
.fx-btn-primary-h {
  font-size: 13px; padding: 10px 20px; color: white;
  background: linear-gradient(135deg, #a855f7, #0ea5e9);
  box-shadow: 0 4px 20px rgba(168,85,247,0.4);
}
.fx-btn-primary-h:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(168,85,247,0.6); color: white; }
.fx-btn-glass-h {
  font-size: 13px; padding: 10px 20px; color: rgba(245,242,255,0.65);
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
}
.fx-btn-glass-h:hover { background: rgba(192,132,252,0.1); border-color: rgba(192,132,252,0.3); color: white; }

/* Section headers */
.fx-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.fx-section-ttl {
  font-size: 15px; font-weight: 800; color: rgba(245,242,255,0.9);
  display: flex; align-items: center; gap: 8px;
}
.fx-section-ttl::before {
  content: ''; display: inline-block; width: 3px; height: 16px; flex-shrink: 0;
  background: linear-gradient(180deg, #c084fc, #22d3ee); border-radius: 3px;
}
.fx-section-lnk { font-size: 12px; color: rgba(192,132,252,0.6); font-weight: 500; transition: color 0.2s; text-decoration: none; }
.fx-section-lnk:hover { color: #c084fc; }

/* Bento grid */
.fx-bento2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 900px) { .fx-bento2 { grid-template-columns: repeat(2, 1fr); } }

.fx-card2 {
  display: block; cursor: pointer; border-radius: 16px; overflow: hidden;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.25s; text-decoration: none;
}
.fx-card2:hover { border-color: rgba(192,132,252,0.25); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 20px rgba(168,85,247,0.12); }
.fx-card2-featured { grid-column: span 2; grid-row: span 2; position: relative; }
.fx-card2-img { position: relative; aspect-ratio: 2/3; overflow: hidden; }
.fx-card2-featured .fx-card2-img { position: absolute; inset: 0; aspect-ratio: unset; width: 100%; height: 100%; }
.fx-card2-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,6,15,0.9) 0%, transparent 50%); }
.fx-card2-featured .fx-card2-grad { background: linear-gradient(to top, rgba(7,6,15,0.97) 0%, rgba(7,6,15,0.4) 45%, transparent 100%); }
.fx-card2-featured .fx-card2-foot { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 24px 20px 20px; }
.fx-card2-featured .fx-card2-ttl { font-size: 15px; -webkit-line-clamp: 3; }
.fx-card2-scan {
  position: absolute; left: 0; right: 0; height: 1px; top: 0; opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(192,132,252,0.6), transparent);
  pointer-events: none; animation: fx-scan-card 3s linear infinite;
}
.fx-card2:hover .fx-card2-scan { opacity: 1; }
@keyframes fx-scan-card { 0% { top: 0%; } 100% { top: 100%; } }
.fx-card2-ep {
  font-size: 10px; font-family: monospace; font-weight: 700;
  padding: 2px 6px; border-radius: 6px;
  background: rgba(168,85,247,0.25); color: #c084fc; border: 1px solid rgba(192,132,252,0.3);
}
.fx-card2-foot { padding: 10px 12px; }
.fx-card2-ttl  { font-size: 12px; font-weight: 600; color: rgba(245,242,255,0.8); line-height: 1.3; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fx-card2-excerpt { font-size: 11px; color: rgba(245,242,255,0.45); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.fx-card2-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fx-card2-date { font-size: 10px; color: rgba(245,242,255,0.28); }
.fx-card2-read { font-size: 10px; font-weight: 600; color: #c084fc; letter-spacing: 0.03em; }

/* Two-column layout */
.fx-two-col { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
@media (max-width: 900px) { .fx-two-col { grid-template-columns: 1fr; } }

/* News rows */
.fx-news-row2 {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.2s; cursor: pointer; text-decoration: none;
}
.fx-news-row2:hover { background: rgba(255,255,255,0.055); border-color: rgba(192,132,252,0.18); transform: translateX(3px); }
.fx-news-thumb { width: 48px; height: 36px; border-radius: 8px; flex-shrink: 0; overflow: hidden; position: relative; background: rgba(168,85,247,0.15); }
.fx-news-meta  { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.fx-news-date  { font-size: 10px; color: rgba(245,242,255,0.28); }
.fx-news-ttl   { font-size: 12px; font-weight: 600; color: rgba(245,242,255,0.8); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Sidebar panels */
.fx-panel2 {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 16px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.fx-panel2-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(245,242,255,0.4); margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.fx-panel2-title::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #c084fc, #22d3ee); }
.fx-stats-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.fx-stat-box2 {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 12px; text-align: center;
}
.fx-stat-num2 { font-size: 22px; font-weight: 900; color: #c084fc; line-height: 1; margin-bottom: 4px; }
.fx-stat-lbl2 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,242,255,0.28); }

/* Releases grid (poster portrait) */
.fx-releases-grid {
  display: grid; gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}
@media (min-width: 480px)  { .fx-releases-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .fx-releases-grid { grid-template-columns: repeat(6, 1fr); } }

.fx-poster-card { display: block; cursor: pointer; text-decoration: none; }
.fx-poster-thumb { transition: box-shadow 0.3s; }
.fx-poster-img   { opacity: 0.82; transition: transform 0.4s ease, opacity 0.3s; }
.fx-poster-card:hover .fx-poster-img  { transform: scale(1.06); opacity: 1; }
.fx-poster-card:hover .fx-poster-thumb {
  box-shadow: 0 0 0 1px rgba(192,132,252,0.35), 0 16px 32px rgba(0,0,0,0.6), 0 0 28px rgba(168,85,247,0.22);
}
</style>
