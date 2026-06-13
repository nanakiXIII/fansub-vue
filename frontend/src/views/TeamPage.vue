<template>
  <div>
    <!-- HERO -->
    <div class="relative min-h-[220px] flex items-end overflow-hidden">
      <div class="absolute inset-0" style="background: linear-gradient(135deg,#1a1020,#2a1850,#120a28)"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.55) 50%, transparent 100%)"></div>
      <!-- Screentone overlay -->
      <div class="absolute inset-0 opacity-[0.04]"
           style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>

      <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-7">
        <!-- Breadcrumb -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'

const team    = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    team.value = await http.get('/team')
  } finally {
    loading.value = false
  }
})

const stats = computed(() => [
  { value: loading.value ? '…' : team.value.length, label: 'Membres actifs'      },
  { value: '6',                                      label: 'Saisons traduites'   },
  { value: '300+',                                   label: 'Épisodes sous-titrés'},
  { value: '2019',                                   label: 'Création du fansub'  },
])

const departments = computed(() => [
  { name: 'Direction & coordination', members: team.value.filter(m => m.department === 'Direction')  },
  { name: 'Traduction',               members: team.value.filter(m => m.department === 'Traduction') },
  { name: 'Édition & time',           members: team.value.filter(m => m.department === 'Édition')    },
  { name: 'Qualité & communauté',     members: team.value.filter(m => m.department === 'Communauté') },
])
</script>
