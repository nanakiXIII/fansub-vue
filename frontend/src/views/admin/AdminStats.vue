<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-[18px] font-extrabold text-white">Statistiques</h1>
      <button @click="reload" :disabled="loading" class="btn-outline text-[12px] py-1.5 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Sous-menu -->
    <div class="flex gap-1 p-1 bg-bg-1 border border-white/[0.07] rounded-xl w-fit">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
        :class="activeTab === tab.id ? 'bg-bg-2 text-white shadow-sm' : 'text-ink-3 hover:text-ink-1'"
      >
        <span v-html="tab.icon" class="w-3.5 h-3.5 shrink-0"></span>
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Onglet Séries ── -->
    <template v-if="activeTab === 'series'">

      <!-- KPI -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="kpi in seriesKpis" :key="kpi.label" class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">{{ kpi.label }}</div>
          <div class="text-[28px] font-extrabold tracking-tight" :class="kpi.color">
            {{ loading ? '—' : kpi.value.toLocaleString('fr-FR') }}
          </div>
        </div>
      </div>

      <!-- Graphiques Top 10 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4">
          <div class="text-[11px] font-bold text-ink-2 mb-3">Top 10 par vues</div>
          <div class="flex flex-col gap-2">
            <template v-if="loading">
              <div v-for="n in 5" :key="n" class="h-6 bg-white/[0.05] rounded animate-pulse"></div>
            </template>
            <template v-else>
              <div v-for="row in top10Views" :key="row.serieId" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[11px] text-ink-1 truncate">{{ row.title }}</span>
                  <span class="text-[11px] font-bold text-orange shrink-0">{{ row.views.toLocaleString('fr-FR') }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-orange/70" :style="{ width: pct(row.views, top10Views, 'views') + '%' }"></div>
                </div>
              </div>
              <div v-if="!top10Views.length" class="text-[11px] text-ink-3 py-2">Aucune vue enregistrée</div>
            </template>
          </div>
        </div>
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4">
          <div class="text-[11px] font-bold text-ink-2 mb-3">Top 10 par téléchargements</div>
          <div class="flex flex-col gap-2">
            <template v-if="loading">
              <div v-for="n in 5" :key="n" class="h-6 bg-white/[0.05] rounded animate-pulse"></div>
            </template>
            <template v-else>
              <div v-for="row in top10Downloads" :key="row.serieId" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[11px] text-ink-1 truncate">{{ row.title }}</span>
                  <span class="text-[11px] font-bold text-blue-400 shrink-0">{{ row.downloads.toLocaleString('fr-FR') }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-blue-400/70" :style="{ width: pct(row.downloads, top10Downloads, 'downloads') + '%' }"></div>
                </div>
              </div>
              <div v-if="!top10Downloads.length" class="text-[11px] text-ink-3 py-2">Aucun téléchargement enregistré</div>
            </template>
          </div>
        </div>
      </div>

      <!-- Tri -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-ink-3">Trier par</span>
        <div class="flex gap-1 p-1 bg-bg-1 border border-white/[0.07] rounded-lg">
          <button
            v-for="s in seriesSorts" :key="s.id"
            @click="seriesSort = s.id"
            class="px-3 py-1 rounded-md text-[11px] font-semibold transition-colors"
            :class="seriesSort === s.id ? 'bg-bg-2 text-white' : 'text-ink-3 hover:text-ink-1'"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Tableau séries -->
      <section class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
          <svg class="w-4 h-4 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
          </svg>
          <span class="text-[13px] font-bold text-white">Séries</span>
          <span class="ml-auto text-[11px] text-ink-3">{{ sortedSeriesRows.length }} série(s)</span>
        </div>
        <div v-if="loading" class="p-5 text-[12px] text-ink-3 text-center">Chargement…</div>
        <div v-else-if="!sortedSeriesRows.length" class="p-5 text-[12px] text-ink-3 text-center">Aucune série</div>
        <table v-else class="w-full text-[12px]">
          <thead>
            <tr class="border-b border-white/[0.07] text-[10px] text-ink-3 uppercase tracking-widest">
              <th class="pl-5 py-2.5 text-left font-bold w-6">#</th>
              <th class="py-2.5 px-3 text-left font-bold">Série</th>
              <th class="py-2.5 px-3 text-center font-bold w-24">Statut</th>
              <th class="py-2.5 px-3 text-center font-bold w-16">Ep.</th>
              <th class="py-2.5 px-3 text-right font-bold w-24 cursor-pointer hover:text-white" @click="seriesSort = 'views'">
                <span :class="seriesSort === 'views' ? 'text-orange' : ''">Vues</span>
              </th>
              <th class="py-2.5 px-3 text-right font-bold w-32 cursor-pointer hover:text-white" @click="seriesSort = 'downloads'">
                <span :class="seriesSort === 'downloads' ? 'text-blue-400' : ''">Téléchargements</span>
              </th>
              <th class="pr-5 py-2.5 text-right font-bold w-28">Ajouté</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in sortedSeriesRows" :key="row._id" class="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
              <td class="pl-5 py-2.5 text-ink-3 font-bold">{{ i + 1 }}</td>
              <td class="py-2.5 px-3 min-w-0">
                <div class="flex items-center gap-2.5">
                  <img loading="lazy" v-if="row.poster" :src="row.poster" class="w-8 h-11 rounded object-cover shrink-0 bg-bg-2" />
                  <div v-else class="w-8 h-11 rounded bg-bg-2 shrink-0 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-ink-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
                  </div>
                  <div class="min-w-0">
                    <div class="text-ink-1 font-semibold truncate max-w-[220px]">{{ row.title }}</div>
                    <div class="flex flex-wrap gap-1 mt-0.5">
                      <span v-for="g in row.genres.slice(0, 2)" :key="g" class="text-[9px] text-ink-3 bg-white/[0.05] px-1.5 py-0.5 rounded">{{ g }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-2.5 px-3 text-center">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="statusClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-center text-ink-2 font-semibold">{{ row.episodesAired || '—' }}</td>
              <td class="py-2.5 px-3 text-right font-bold" :class="seriesSort === 'views' ? 'text-orange' : 'text-ink-1'">
                {{ row.views.toLocaleString('fr-FR') }}
              </td>
              <td class="py-2.5 px-3 text-right font-bold" :class="seriesSort === 'downloads' ? 'text-blue-400' : 'text-ink-1'">
                {{ row.downloads.toLocaleString('fr-FR') }}
              </td>
              <td class="pr-5 py-2.5 text-right text-ink-3 whitespace-nowrap">{{ fmtDate(row.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

    </template>

    <!-- ── Onglet Actualités ── -->
    <template v-else-if="activeTab === 'news'">

      <!-- KPI news -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="kpi in newsKpis" :key="kpi.label" class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">{{ kpi.label }}</div>
          <div class="text-[28px] font-extrabold tracking-tight" :class="kpi.color">
            {{ loading ? '—' : kpi.value.toLocaleString('fr-FR') }}
          </div>
        </div>
      </div>

      <!-- Graphiques Top 10 news -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4">
          <div class="text-[11px] font-bold text-ink-2 mb-3">Top 10 par vues</div>
          <div class="flex flex-col gap-2">
            <template v-if="loading">
              <div v-for="n in 5" :key="n" class="h-6 bg-white/[0.05] rounded animate-pulse"></div>
            </template>
            <template v-else>
              <div v-for="row in top10NewsViews" :key="String(row._id)" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[12px] shrink-0">{{ row.icon }}</span>
                    <span class="text-[11px] text-ink-1 truncate">{{ row.title }}</span>
                  </div>
                  <span class="text-[11px] font-bold text-orange shrink-0">{{ row.views.toLocaleString('fr-FR') }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-orange/70" :style="{ width: pct(row.views, top10NewsViews, 'views') + '%' }"></div>
                </div>
              </div>
              <div v-if="!top10NewsViews.length" class="text-[11px] text-ink-3 py-2">Aucune vue enregistrée</div>
            </template>
          </div>
        </div>
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4">
          <div class="text-[11px] font-bold text-ink-2 mb-3">Top 10 par commentaires</div>
          <div class="flex flex-col gap-2">
            <template v-if="loading">
              <div v-for="n in 5" :key="n" class="h-6 bg-white/[0.05] rounded animate-pulse"></div>
            </template>
            <template v-else>
              <div v-for="row in top10NewsComments" :key="String(row._id)" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[12px] shrink-0">{{ row.icon }}</span>
                    <span class="text-[11px] text-ink-1 truncate">{{ row.title }}</span>
                  </div>
                  <span class="text-[11px] font-bold text-purple-400 shrink-0">{{ row.comments.toLocaleString('fr-FR') }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-purple-400/70" :style="{ width: pct(row.comments, top10NewsComments, 'comments') + '%' }"></div>
                </div>
              </div>
              <div v-if="!top10NewsComments.length" class="text-[11px] text-ink-3 py-2">Aucun commentaire</div>
            </template>
          </div>
        </div>
      </div>

      <!-- Tri news -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-ink-3">Trier par</span>
        <div class="flex gap-1 p-1 bg-bg-1 border border-white/[0.07] rounded-lg">
          <button
            v-for="s in newsSorts" :key="s.id"
            @click="newsSort = s.id"
            class="px-3 py-1 rounded-md text-[11px] font-semibold transition-colors"
            :class="newsSort === s.id ? 'bg-bg-2 text-white' : 'text-ink-3 hover:text-ink-1'"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Tableau actualités -->
      <section class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
          <svg class="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/>
          </svg>
          <span class="text-[13px] font-bold text-white">Articles</span>
          <span class="ml-auto text-[11px] text-ink-3">{{ sortedNewsRows.length }} article(s)</span>
        </div>
        <div v-if="loading" class="p-5 text-[12px] text-ink-3 text-center">Chargement…</div>
        <div v-else-if="!sortedNewsRows.length" class="p-5 text-[12px] text-ink-3 text-center">Aucun article</div>
        <table v-else class="w-full text-[12px]">
          <thead>
            <tr class="border-b border-white/[0.07] text-[10px] text-ink-3 uppercase tracking-widest">
              <th class="pl-5 py-2.5 text-left font-bold w-6">#</th>
              <th class="py-2.5 px-3 text-left font-bold">Article</th>
              <th class="py-2.5 px-3 text-center font-bold w-24">Statut</th>
              <th class="py-2.5 px-3 text-right font-bold w-24 cursor-pointer hover:text-white" @click="newsSort = 'views'">
                <span :class="newsSort === 'views' ? 'text-orange' : ''">Vues</span>
              </th>
              <th class="py-2.5 px-3 text-right font-bold w-28 cursor-pointer hover:text-white" @click="newsSort = 'comments'">
                <span :class="newsSort === 'comments' ? 'text-purple-400' : ''">Commentaires</span>
              </th>
              <th class="pr-5 py-2.5 text-right font-bold w-28">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in sortedNewsRows" :key="row._id" class="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
              <td class="pl-5 py-2.5 text-ink-3 font-bold">{{ i + 1 }}</td>
              <td class="py-2.5 px-3 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-base shrink-0">{{ row.icon }}</span>
                  <div class="min-w-0">
                    <div class="text-ink-1 font-semibold truncate max-w-[260px]">{{ row.title }}</div>
                    <div class="text-ink-3 text-[10px]">{{ row.category }}</div>
                  </div>
                </div>
              </td>
              <td class="py-2.5 px-3 text-center">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="row.published ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'">
                  {{ row.published ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-right font-bold" :class="newsSort === 'views' ? 'text-orange' : 'text-ink-1'">
                {{ row.views.toLocaleString('fr-FR') }}
              </td>
              <td class="py-2.5 px-3 text-right font-bold" :class="newsSort === 'comments' ? 'text-purple-400' : 'text-ink-1'">
                {{ row.comments.toLocaleString('fr-FR') }}
              </td>
              <td class="pr-5 py-2.5 text-right text-ink-3 whitespace-nowrap">{{ fmtDate(row.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

    </template>

    <!-- ── Onglet Commentaires ── -->
    <template v-else-if="activeTab === 'comments'">

      <!-- KPI -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Total</div>
          <div class="text-[28px] font-extrabold text-white">{{ loading ? '—' : commentsData.total.toLocaleString('fr-FR') }}</div>
        </div>
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">En attente</div>
          <div class="text-[28px] font-extrabold" :class="commentsData.pending > 0 ? 'text-orange' : 'text-ink-2'">
            {{ loading ? '—' : commentsData.pending.toLocaleString('fr-FR') }}
          </div>
        </div>
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Approuvés</div>
          <div class="text-[28px] font-extrabold text-emerald-400">{{ loading ? '—' : commentsData.approved.toLocaleString('fr-FR') }}</div>
        </div>
        <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1">
          <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Rejetés</div>
          <div class="text-[28px] font-extrabold text-red-400">{{ loading ? '—' : commentsData.rejected.toLocaleString('fr-FR') }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Top séries commentées -->
        <section class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
            <svg class="w-4 h-4 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
            </svg>
            <span class="text-[13px] font-bold text-white">Top séries commentées</span>
          </div>
          <div v-if="loading" class="p-5 text-[12px] text-ink-3 text-center">Chargement…</div>
          <div v-else-if="!commentsData.perSerie.length" class="p-5 text-[12px] text-ink-3 text-center">Aucun commentaire</div>
          <div v-else class="divide-y divide-white/[0.05]">
            <div
              v-for="(row, i) in commentsData.perSerie"
              :key="row.serieId"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <span class="text-[11px] font-bold text-ink-3 w-5 shrink-0">{{ i + 1 }}</span>
              <img loading="lazy" v-if="row.poster" :src="row.poster" class="w-7 h-10 rounded object-cover shrink-0 bg-bg-2" />
              <div v-else class="w-7 h-10 rounded bg-bg-2 shrink-0"></div>
              <span class="flex-1 text-[12px] font-semibold text-ink-1 truncate">{{ row.title }}</span>
              <span class="text-[13px] font-extrabold text-orange shrink-0">{{ row.count.toLocaleString('fr-FR') }}</span>
            </div>
          </div>
        </section>

        <!-- Top articles commentés -->
        <section class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            </svg>
            <span class="text-[13px] font-bold text-white">Top articles commentés</span>
          </div>
          <div v-if="loading" class="p-5 text-[12px] text-ink-3 text-center">Chargement…</div>
          <div v-else-if="!commentsData.perArticle.length" class="p-5 text-[12px] text-ink-3 text-center">Aucun commentaire</div>
          <div v-else class="divide-y divide-white/[0.05]">
            <div
              v-for="(row, i) in commentsData.perArticle"
              :key="String(row.articleId)"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <span class="text-[11px] font-bold text-ink-3 w-5 shrink-0">{{ i + 1 }}</span>
              <span class="text-base shrink-0">{{ row.icon }}</span>
              <span class="flex-1 text-[12px] font-semibold text-ink-1 truncate">{{ row.title }}</span>
              <span class="text-[13px] font-extrabold text-purple-400 shrink-0">{{ row.count.toLocaleString('fr-FR') }}</span>
            </div>
          </div>
        </section>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'

// ── Onglets ──────────────────────────────────────────────────────
const tabs = [
  {
    id: 'series',
    label: 'Séries',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>',
  },
  {
    id: 'news',
    label: 'Actualités',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>',
  },
  {
    id: 'comments',
    label: 'Commentaires',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
]
const activeTab = ref('series')

// ── Données ──────────────────────────────────────────────────────
const loading      = ref(true)
const seriesData   = ref({ totalViews: 0, totalDownloads: 0, totalSeries: 0, rows: [] })
const newsData     = ref({ totalViews: 0, totalComments: 0, totalArticles: 0, rows: [] })
const commentsData = ref({ total: 0, pending: 0, approved: 0, rejected: 0, perSerie: [], perArticle: [] })

async function reload() {
  loading.value = true
  try {
    const [s, n, c] = await Promise.all([
      http.get('/stats/series'),
      http.get('/stats/news'),
      http.get('/stats/comments'),
    ])
    seriesData.value   = s
    newsData.value     = n
    commentsData.value = c
  } catch {}
  loading.value = false
}
onMounted(reload)

// ── KPI séries ───────────────────────────────────────────────────
const seriesKpis = computed(() => [
  { label: 'Séries',                 value: seriesData.value.totalSeries,    color: 'text-white'    },
  { label: 'Vues totales',           value: seriesData.value.totalViews,     color: 'text-orange'   },
  { label: 'Téléchargements totaux', value: seriesData.value.totalDownloads, color: 'text-blue-400' },
])

// ── Tri séries ────────────────────────────────────────────────────
const seriesSort  = ref('views')
const seriesSorts = [
  { id: 'views',     label: 'Vues' },
  { id: 'downloads', label: 'Téléchargements' },
  { id: 'date',      label: 'Date' },
  { id: 'title',     label: 'Titre' },
]
const sortedSeriesRows = computed(() => {
  const rows = [...seriesData.value.rows]
  if (seriesSort.value === 'views')     return rows.sort((a, b) => b.views     - a.views)
  if (seriesSort.value === 'downloads') return rows.sort((a, b) => b.downloads - a.downloads)
  if (seriesSort.value === 'date')      return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return rows.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
})

// ── KPI news ─────────────────────────────────────────────────────
const newsKpis = computed(() => [
  { label: 'Articles',          value: newsData.value.totalArticles, color: 'text-white'      },
  { label: 'Vues totales',      value: newsData.value.totalViews,    color: 'text-orange'     },
  { label: 'Commentaires',      value: newsData.value.totalComments, color: 'text-purple-400' },
])

// ── Tri actualités ────────────────────────────────────────────────
const newsSort  = ref('views')
const newsSorts = [
  { id: 'views',    label: 'Vues' },
  { id: 'comments', label: 'Commentaires' },
  { id: 'date',     label: 'Date' },
]
const sortedNewsRows = computed(() => {
  const rows = [...newsData.value.rows]
  if (newsSort.value === 'views')    return rows.sort((a, b) => b.views    - a.views)
  if (newsSort.value === 'comments') return rows.sort((a, b) => b.comments - a.comments)
  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// ── Graphiques top 10 ────────────────────────────────────────────
const top10Views     = computed(() => [...seriesData.value.rows].sort((a, b) => b.views     - a.views).slice(0, 10))
const top10Downloads = computed(() => [...seriesData.value.rows].sort((a, b) => b.downloads - a.downloads).slice(0, 10))
const top10NewsViews    = computed(() => [...newsData.value.rows].sort((a, b) => b.views    - a.views).slice(0, 10))
const top10NewsComments = computed(() => [...newsData.value.rows].sort((a, b) => b.comments - a.comments).slice(0, 10))

function pct(count, arr, key) {
  const max = arr[0]?.[key] ?? 1
  return Math.round((count / Math.max(1, max)) * 100)
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_LABELS = {
  ongoing:   'En cours',
  completed: 'Terminée',
  upcoming:  'À venir',
  licensed:  'Licenciée',
  dropped:   'Abandonnée',
}
const STATUS_CLASSES = {
  ongoing:   'bg-green-500/15 text-green-400',
  completed: 'bg-blue-500/15 text-blue-400',
  upcoming:  'bg-yellow-500/15 text-yellow-400',
  licensed:  'bg-red-500/15 text-red-400',
  dropped:   'bg-zinc-500/15 text-zinc-400',
}
function statusLabel(s) { return STATUS_LABELS[s] || s }
function statusClass(s) { return STATUS_CLASSES[s] || 'bg-zinc-500/15 text-zinc-400' }
</script>
