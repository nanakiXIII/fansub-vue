<template>
  <div>
    <!-- HERO -->
    <div class="relative min-h-[220px] flex items-end overflow-hidden">
      <div class="absolute inset-0" style="background: linear-gradient(135deg,#0a1a10,#102a1a,#1a2a0a)"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.55) 50%, transparent 100%)"></div>
      <div class="absolute inset-0 opacity-[0.04]"
           style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>

      <div class="relative z-10 w-full max-w-4xl mx-auto px-6 pb-7">
        <div class="flex items-center gap-1.5 text-[11px] text-ink-3 mb-3">
          <RouterLink to="/" class="text-ink-2 hover:text-orange transition-colors">Accueil</RouterLink>
          <span>›</span>
          <RouterLink to="/equipe" class="text-ink-2 hover:text-orange transition-colors">Équipe</RouterLink>
          <span>›</span>
          <span>Recrutement</span>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Recrutement ouvert
          </span>
        </div>

        <h1 class="text-[20px] sm:text-[28px] font-extrabold text-white leading-tight mb-2">Rejoins l'équipe</h1>
        <p class="text-[13px] text-ink-2 max-w-xl leading-relaxed">
          On est toujours à la recherche de nouvelles têtes passionnées. Bénévole, sans engagement de temps imposé — juste de l'envie et de la rigueur.
        </p>
      </div>
    </div>

    <!-- CONTENU -->
    <div class="max-w-4xl mx-auto px-6 py-8">

      <!-- Postes ouverts -->
      <div class="section-title mb-4">Postes ouverts</div>
      <div class="grid gap-3 mb-10" style="grid-template-columns: repeat(auto-fill, minmax(290px, 1fr))">
        <div
          v-for="role in openRoles"
          :key="role.slug"
          class="bg-bg-1 border rounded-xl p-5 transition-all"
          :class="role.open ? 'border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5' : 'border-white/[0.04] opacity-50'"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              :style="{ background: role.color }"
            >
              {{ role.icon }}
            </div>
            <span
              class="text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0"
              :class="role.open
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'bg-white/5 text-ink-3 border border-white/10'"
            >
              {{ role.open ? 'Ouvert' : 'Complet' }}
            </span>
          </div>
          <div class="text-[13px] font-bold text-white mb-1">{{ role.title }}</div>
          <p class="text-[11px] text-ink-2 leading-relaxed mb-3">{{ role.description }}</p>
          <div class="flex gap-1 flex-wrap">
            <span v-for="t in role.tags" :key="t" class="tag text-[10px] py-0.5 px-2">{{ t }}</span>
          </div>
        </div>
      </div>

      <!-- Comment ça marche -->
      <div class="section-title mb-4">Comment ça marche ?</div>
      <div class="grid sm:grid-cols-3 gap-3 mb-10">
        <div v-for="(step, i) in steps" :key="i" class="bg-bg-1 border border-white/[0.06] rounded-xl p-5">
          <div class="text-[22px] font-extrabold text-orange leading-none mb-2">{{ i + 1 }}.</div>
          <div class="text-[12px] font-bold text-white mb-1">{{ step.title }}</div>
          <p class="text-[11px] text-ink-2 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>

      <!-- Ce qu'on attend -->
      <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-6 mb-6">
        <div class="text-[13px] font-bold text-white mb-3">Ce qu'on attend de toi</div>
        <ul class="flex flex-col gap-2.5">
          <li v-for="req in requirements" :key="req" class="flex items-start gap-2.5 text-[12px] text-ink-2">
            <svg class="w-3.5 h-3.5 text-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ req }}
          </li>
        </ul>
      </div>

      <!-- CTA Discord -->
      <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-6 text-center">
        <div class="text-2xl mb-3">👋</div>
        <div class="text-[15px] font-extrabold text-white mb-1.5">Prêt(e) à nous rejoindre ?</div>
        <p class="text-[12px] text-ink-2 max-w-sm mx-auto mb-4 leading-relaxed">
          Rejoins notre Discord et présente-toi dans le canal <strong class="text-ink-1">#candidatures</strong> — un membre de l'équipe te répondra rapidement.
        </p>
        <a
          :href="config.discordUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary inline-flex items-center gap-2 mx-auto"
        >
          <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Rejoindre le Discord
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { config } from '@/config.js'
import { http } from '@/services/http.js'

const openRoles = ref([])

onMounted(async () => {
  try {
    openRoles.value = await http.get('/recruit')
  } catch {}
})

const steps = [
  {
    title: 'Présente-toi',
    desc: "Rejoins notre Discord et poste une petite présentation dans #candidatures avec le poste qui t'intéresse.",
  },
  {
    title: 'Passe le test',
    desc: "On te soumettra un court exercice adapté au poste — sans pression, c'est juste pour se faire une idée de ton niveau.",
  },
  {
    title: 'Intègre l\'équipe',
    desc: "Bienvenue ! Tu rejoins le serveur staff, on t'explique les workflows et tu pars sur ta première mission.",
  },
]

const requirements = [
  'Disponibilité régulière, même partielle — quelques heures par semaine suffisent',
  'Passion pour l\'animation japonaise et envie d\'apprendre',
  'Rigueur et respect des délais (on s\'organise ensemble)',
  'Bonne communication et esprit d\'équipe',
  'Logiciels fournis ou libres — pas besoin d\'investir',
]
</script>
