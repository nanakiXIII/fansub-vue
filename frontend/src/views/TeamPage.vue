<template>
  <div>

    <!-- ═══════════════════════ GUNDAM LAYOUT ════════════════════════ -->
    <template v-if="layout === 'gundam'">

      <!-- Hero -->
      <div class="tp-hero">
        <div class="tp-hero-hex" aria-hidden="true"></div>
        <div class="tp-hud tp-hud-tl" aria-hidden="true"></div>
        <div class="tp-hud tp-hud-tr" aria-hidden="true"></div>
        <div class="tp-hud tp-hud-bl" aria-hidden="true"></div>
        <div class="tp-hud tp-hud-br" aria-hidden="true"></div>

        <div class="tp-hero-inner">
          <!-- Breadcrumb -->
          <div class="tp-breadcrumb">
            <RouterLink to="/" class="tp-bc-link">Accueil</RouterLink>
            <span class="tp-bc-sep">//</span>
            <span>Équipe</span>
          </div>
          <div class="tp-eyebrow">// FICHIER · PERSONNEL OPÉRATIONNEL</div>
          <h1 class="tp-hero-title">Notre équipe</h1>
          <p class="tp-hero-sub">Bénévoles passionné(e)s — traduction, adaptation, édition — saison après saison.</p>
        </div>

        <div class="tp-hero-bottom" aria-hidden="true"></div>
      </div>

      <!-- Contenu -->
      <div class="tp-layout">

        <!-- Stats -->
        <div class="tp-stats">
          <div v-for="stat in stats" :key="stat.label" class="tp-stat">
            <div class="tp-stat-value">{{ stat.value }}</div>
            <div class="tp-stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Séparateur -->
        <div class="tp-divider"></div>

        <!-- Pôles -->
        <div v-for="dept in departments.filter(d => d.members.length)" :key="dept.name" class="tp-dept">
          <div class="tp-dept-head">
            <div class="tp-dept-mark"></div>
            <span class="section-title">{{ dept.name }}</span>
            <span class="tp-dept-count">{{ dept.members.length }} membre{{ dept.members.length > 1 ? 's' : '' }}</span>
          </div>

          <div class="tp-cards">
            <div v-for="m in dept.members" :key="m.slug" class="tp-card">
              <!-- Top accent -->
              <div class="tp-card-top"></div>
              <div class="tp-card-inner">
                <!-- Avatar + identité -->
                <div class="tp-card-header">
                  <div class="tp-avatar" :style="{ background: m.avatarGradient }">
                    {{ m.initials }}
                  </div>
                  <div class="min-w-0">
                    <div class="tp-name">{{ m.name }}</div>
                    <div class="tp-role">{{ m.role }}</div>
                  </div>
                </div>
                <!-- Bio -->
                <p class="tp-bio">{{ m.bio }}</p>
                <!-- Footer : tags + date -->
                <div class="tp-card-footer">
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="t in m.tags" :key="t" class="tag text-[10px] py-0.5 px-2">{{ t }}</span>
                  </div>
                  <span class="tp-joined">{{ m.joined }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA recrutement -->
        <div class="tp-cta">
          <div class="tp-cta-mark"></div>
          <div class="tp-cta-inner">
            <div class="tp-cta-eyebrow">// RECRUTEMENT OUVERT</div>
            <div class="tp-cta-title">Rejoins l'équipe</div>
            <p class="tp-cta-sub">Traducteurs, correcteurs, éditeurs — aucune contrainte de temps, juste de la passion et l'envie d'apprendre.</p>
            <RouterLink to="/recrutement" class="btn-primary inline-flex">
              Voir les postes ouverts
            </RouterLink>
          </div>
        </div>

      </div>
    </template>

    <!-- ═══════════════════════ DEFAULT LAYOUT ═══════════════════════ -->
    <template v-else>

      <!-- HERO -->
      <div class="relative min-h-[220px] flex items-end overflow-hidden">
        <div class="absolute inset-0" style="background: linear-gradient(135deg,#1a1020,#2a1850,#120a28)"></div>
        <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.55) 50%, transparent 100%)"></div>
        <div class="absolute inset-0 opacity-[0.04]"
             style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>

        <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-7">
          <div class="flex items-center gap-1.5 text-[11px] text-ink-3 mb-3">
            <RouterLink to="/" class="text-ink-2 hover:text-orange transition-colors">Accueil</RouterLink>
            <span>›</span>
            <span>Équipe</span>
          </div>
          <h1 class="text-[20px] sm:text-[28px] font-extrabold text-white leading-tight mb-2">Notre équipe</h1>
          <p class="text-[13px] text-ink-2 max-w-xl leading-relaxed">
            Une bande de passionné(e)s bénévoles qui traduisent, adaptent et mettent en forme vos animes préférés, saison après saison.
          </p>
        </div>
      </div>

      <!-- CONTENU -->
      <div class="max-w-6xl mx-auto px-6 py-8">

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-9">
          <div v-for="stat in stats" :key="stat.label" class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 text-center">
            <div class="text-[22px] font-extrabold text-orange leading-none mb-1">{{ stat.value }}</div>
            <div class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Pôles -->
        <div v-for="dept in departments" :key="dept.name" class="mb-9">
          <div class="section-title mb-4">{{ dept.name }}</div>
          <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))">
            <div
              v-for="m in dept.members"
              :key="m.slug"
              class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 transition-all hover:border-white/20 hover:-translate-y-0.5"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                  :style="{ background: m.avatarGradient }"
                >
                  {{ m.initials }}
                </div>
                <div class="min-w-0">
                  <div class="text-[13px] font-bold text-white leading-tight truncate">{{ m.name }}</div>
                  <div class="text-[11px] text-orange font-medium truncate">{{ m.role }}</div>
                </div>
              </div>
              <p class="text-[11px] text-ink-2 leading-relaxed mb-3">{{ m.bio }}</p>
              <div class="flex items-center justify-between gap-2">
                <div class="flex gap-1 flex-wrap">
                  <span v-for="t in m.tags" :key="t" class="tag text-[10px] py-0.5 px-2">{{ t }}</span>
                </div>
                <span class="text-[10px] text-ink-3 shrink-0">Depuis {{ m.joined }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA recrutement -->
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-6 text-center">
          <div class="text-[16px] font-extrabold text-white mb-1.5">🎉 Recrutement ouvert</div>
          <p class="text-[12px] text-ink-2 max-w-md mx-auto mb-4 leading-relaxed">
            On cherche toujours de nouvelles bonnes volontés — traducteurs, correcteurs, éditeurs... Aucune contrainte de temps imposée, juste de la passion et l'envie d'apprendre.
          </p>
          <RouterLink to="/recrutement" class="btn-primary mx-auto inline-flex">Voir les postes ouverts</RouterLink>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { layout } from '@/composables/useTheme.js'
import { useBeta } from '@/composables/useBeta.js'

const { foundedYear } = useBeta()
const team       = ref([])
const homeStats  = ref({ episodes: 0, seasons: 0 })
const loading    = ref(true)

onMounted(async () => {
  try {
    const [teamRes, homeRes] = await Promise.all([
      http.get('/team'),
      http.get('/home'),
    ])
    team.value      = teamRes
    homeStats.value = homeRes.stats
  } finally {
    loading.value = false
  }
})

const stats = computed(() => [
  { value: loading.value ? '…' : team.value.length,                          label: 'Membres actifs'       },
  { value: loading.value ? '…' : homeStats.value.seasons,                    label: 'Saisons traduites'    },
  { value: loading.value ? '…' : homeStats.value.episodes.toLocaleString('fr-FR'), label: 'Épisodes sous-titrés' },
  { value: foundedYear.value,                                                label: 'Création du fansub'   },
])

const departments = computed(() => [
  { name: 'Direction & coordination', members: team.value.filter(m => m.department === 'Direction')  },
  { name: 'Traduction',               members: team.value.filter(m => m.department === 'Traduction') },
  { name: 'Édition & time',           members: team.value.filter(m => m.department === 'Édition')    },
  { name: 'Qualité & communauté',     members: team.value.filter(m => m.department === 'Communauté') },
])
</script>

<style scoped>
/* ── Hero ───────────────────────────────────────────────────────── */
.tp-hero {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: linear-gradient(160deg, #0a1628 0%, #04070f 60%);
}
.tp-hero-hex {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(60deg,  rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(120deg, rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(0deg,   rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%);
  background-size: 40px 40px;
}
.tp-hud { position: absolute; width: 16px; height: 16px; z-index: 2; }
.tp-hud-tl { top: 10px;    left: 10px;  border-top: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.tp-hud-tr { top: 10px;    right: 10px; border-top: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }
.tp-hud-bl { bottom: 10px; left: 10px;  border-bottom: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.tp-hud-br { bottom: 10px; right: 10px; border-bottom: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }

.tp-hero-inner {
  position: relative; z-index: 2;
  width: 100%; max-width: 1280px; margin: 0 auto;
  padding: 32px 24px 28px;
}
.tp-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 9px; font-family: 'Courier New', monospace;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: rgb(var(--color-ink-3)); margin-bottom: 10px;
}
.tp-bc-link { color: rgb(var(--color-ink-2)); transition: color 0.15s; }
.tp-bc-link:hover { color: rgb(var(--color-orange)); }
.tp-bc-sep { color: rgb(var(--color-orange)); opacity: 0.5; }
.tp-eyebrow {
  font-size: 8px; font-family: 'Courier New', monospace;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgb(var(--color-orange)); opacity: 0.75; margin-bottom: 8px;
}
.tp-hero-title {
  font-size: 28px; font-weight: 900; letter-spacing: 0.06em;
  text-transform: uppercase; color: white; line-height: 1.1; margin-bottom: 6px;
}
.tp-hero-sub { font-size: 12px; color: rgb(var(--color-ink-2)); max-width: 500px; }
.tp-hero-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, rgb(var(--color-orange)), rgba(var(--color-orange), 0.3) 60%, transparent);
}

/* ── Layout ─────────────────────────────────────────────────────── */
.tp-layout {
  max-width: 1280px; margin: 0 auto; padding: 28px 24px;
  display: flex; flex-direction: column; gap: 32px;
}

/* ── Stats ──────────────────────────────────────────────────────── */
.tp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 640px) { .tp-stats { grid-template-columns: repeat(2, 1fr); } }
.tp-stat {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.1);
  border-top: 2px solid rgba(var(--color-orange), 0.45);
  padding: 14px 12px; text-align: center;
}
.tp-stat-value { font-size: 26px; font-weight: 900; color: rgb(var(--color-orange)); line-height: 1; margin-bottom: 4px; }
.tp-stat-label { font-size: 8px; font-family: 'Courier New', monospace; letter-spacing: 0.14em; text-transform: uppercase; color: rgb(var(--color-ink-3)); }

/* ── Séparateur ─────────────────────────────────────────────────── */
.tp-divider { height: 1px; background: linear-gradient(90deg, rgba(var(--color-orange), 0.25), transparent); }

/* ── Département ────────────────────────────────────────────────── */
.tp-dept-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.tp-dept-mark { width: 3px; height: 16px; background: rgb(var(--color-orange)); box-shadow: 0 0 8px rgba(var(--color-orange), 0.5); flex-shrink: 0; }
.tp-dept-count { font-size: 8px; font-family: 'Courier New', monospace; letter-spacing: 0.12em; color: rgb(var(--color-ink-3)); margin-left: auto; }

/* ── Cards ──────────────────────────────────────────────────────── */
.tp-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.tp-card {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.1);
  position: relative;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.tp-card:hover {
  border-color: rgba(var(--color-orange), 0.3);
  box-shadow: 0 0 20px rgba(var(--color-orange), 0.06);
}
.tp-card-top {
  height: 2px;
  background: rgba(var(--color-orange), 0.45);
  transition: background 0.15s;
}
.tp-card:hover .tp-card-top { background: rgb(var(--color-orange)); }
.tp-card-inner { padding: 14px; }

.tp-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.tp-avatar {
  width: 44px; height: 44px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: white;
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}
.tp-name { font-size: 13px; font-weight: 700; color: white; line-height: 1.2; }
.tp-role {
  font-size: 9px; font-family: 'Courier New', monospace;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgb(var(--color-orange)); margin-top: 2px;
}
.tp-bio { font-size: 11px; color: rgb(var(--color-ink-2)); line-height: 1.65; margin-bottom: 10px; }
.tp-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.tp-joined {
  font-size: 9px; font-family: 'Courier New', monospace;
  color: rgb(var(--color-ink-3)); letter-spacing: 0.06em; white-space: nowrap; shrink: 0;
}

/* ── CTA ────────────────────────────────────────────────────────── */
.tp-cta {
  position: relative;
  border: 1px solid rgba(var(--color-orange), 0.18);
  border-top: 2px solid rgba(var(--color-orange), 0.55);
  overflow: hidden;
}
.tp-cta-mark {
  position: absolute; top: 0; left: 0; right: 0; height: 100%;
  background: repeating-linear-gradient(
    60deg,
    rgba(var(--color-orange), 0.015) 0, rgba(var(--color-orange), 0.015) 1px,
    transparent 0, transparent 50%
  );
  background-size: 30px 30px;
  pointer-events: none;
}
.tp-cta-inner { position: relative; z-index: 1; padding: 32px; text-align: center; }
.tp-cta-eyebrow {
  font-size: 9px; font-family: 'Courier New', monospace;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgb(var(--color-orange)); opacity: 0.8; margin-bottom: 8px;
}
.tp-cta-title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: white; margin-bottom: 8px; }
.tp-cta-sub { font-size: 12px; color: rgb(var(--color-ink-2)); max-width: 420px; margin: 0 auto 20px; line-height: 1.7; }
</style>
