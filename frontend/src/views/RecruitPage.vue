<template>
  <div>

    <!-- ═══════════════════════ GUNDAM LAYOUT ════════════════════════ -->
    <template v-if="layout === 'gundam'">

      <!-- Hero -->
      <div class="rp-hero">
        <div class="rp-hero-hex" aria-hidden="true"></div>
        <div class="rp-hud rp-hud-tl" aria-hidden="true"></div>
        <div class="rp-hud rp-hud-tr" aria-hidden="true"></div>
        <div class="rp-hud rp-hud-bl" aria-hidden="true"></div>
        <div class="rp-hud rp-hud-br" aria-hidden="true"></div>
        <div class="rp-hero-inner">
          <div class="rp-breadcrumb">
            <RouterLink to="/" class="rp-bc-link">Accueil</RouterLink>
            <span class="rp-bc-sep">//</span>
            <RouterLink to="/equipe" class="rp-bc-link">Équipe</RouterLink>
            <span class="rp-bc-sep">//</span>
            <span>Recrutement</span>
          </div>
          <div class="rp-status">
            <span class="rp-status-dot"></span>
            RECRUTEMENT OUVERT
          </div>
          <h1 class="rp-hero-title">Rejoins l'équipe</h1>
          <p class="rp-hero-sub">Bénévole, sans engagement de temps imposé — juste de l'envie et de la rigueur.</p>
        </div>
        <div class="rp-hero-bottom" aria-hidden="true"></div>
      </div>

      <!-- Contenu -->
      <div class="rp-layout">

        <!-- Postes ouverts -->
        <div>
          <div class="rp-section-head">
            <div class="rp-section-mark"></div>
            <span class="section-title">Postes ouverts</span>
            <span class="rp-section-count">{{ openRoles.filter(r => r.open).length }} poste{{ openRoles.filter(r => r.open).length > 1 ? 's' : '' }} disponible{{ openRoles.filter(r => r.open).length > 1 ? 's' : '' }}</span>
          </div>
          <div class="rp-roles">
            <div
              v-for="role in openRoles"
              :key="role.slug"
              class="rp-role"
              :class="!role.open && 'rp-role--closed'"
            >
              <div class="rp-role-top"></div>
              <div class="rp-role-inner">
                <div class="rp-role-head">
                  <div class="rp-role-icon" :style="{ background: role.color }">{{ role.icon }}</div>
                  <div class="flex-1 min-w-0">
                    <div class="rp-role-title">{{ role.title }}</div>
                    <div class="rp-role-tags">
                      <span v-for="t in role.tags" :key="t" class="tag text-[10px] py-0.5 px-2">{{ t }}</span>
                    </div>
                  </div>
                  <div class="rp-role-badge" :class="role.open ? 'rp-badge-open' : 'rp-badge-closed'">
                    <span class="rp-badge-dot" :class="role.open ? 'rp-dot-open' : 'rp-dot-closed'"></span>
                    {{ role.open ? 'OUVERT' : 'COMPLET' }}
                  </div>
                </div>
                <p class="rp-role-desc">{{ role.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comment ça marche -->
        <div>
          <div class="rp-section-head">
            <div class="rp-section-mark"></div>
            <span class="section-title">Procédure</span>
          </div>
          <div class="rp-steps">
            <div v-for="(step, i) in steps" :key="i" class="rp-step">
              <div class="rp-step-num">0{{ i + 1 }}</div>
              <div class="rp-step-connector" v-if="i < steps.length - 1" aria-hidden="true"></div>
              <div class="rp-step-body">
                <div class="rp-step-title">{{ step.title }}</div>
                <p class="rp-step-desc">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ce qu'on attend -->
        <div class="rp-requirements">
          <div class="rp-req-top" aria-hidden="true"></div>
          <div class="rp-req-inner">
            <div class="rp-req-eyebrow">// CRITÈRES DE SÉLECTION</div>
            <div class="rp-req-title">Ce qu'on attend de toi</div>
            <ul class="rp-req-list">
              <li v-for="req in requirements" :key="req" class="rp-req-item">
                <span class="rp-req-bullet">▶</span>
                {{ req }}
              </li>
            </ul>
          </div>
        </div>

        <!-- CTA Discord -->
        <div class="rp-cta">
          <div class="rp-cta-hex" aria-hidden="true"></div>
          <div class="rp-cta-inner">
            <div class="rp-cta-eyebrow">// CANAL DE CONTACT</div>
            <div class="rp-cta-title">Prêt(e) à nous rejoindre ?</div>
            <p class="rp-cta-sub">
              Rejoins notre Discord et présente-toi dans le canal
              <span class="text-orange font-mono">#candidatures</span>
              — un membre de l'équipe te répondra rapidement.
            </p>
            <a
              :href="config.discordUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary inline-flex items-center gap-2"
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

    <!-- ═══════════════════════ DEFAULT LAYOUT ═══════════════════════ -->
    <template v-else>

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
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" :style="{ background: role.color }">
                {{ role.icon }}
              </div>
              <span
                class="text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0"
                :class="role.open ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-white/5 text-ink-3 border border-white/10'"
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
          <a :href="config.discordUrl" target="_blank" rel="noopener noreferrer" class="btn-primary inline-flex items-center gap-2 mx-auto">
            <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Rejoindre le Discord
          </a>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { config } from '@/config.js'
import { http } from '@/services/http.js'
import { layout } from '@/composables/useTheme.js'

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
    title: "Intègre l'équipe",
    desc: "Bienvenue ! Tu rejoins le serveur staff, on t'explique les workflows et tu pars sur ta première mission.",
  },
]

const requirements = [
  'Disponibilité régulière, même partielle — quelques heures par semaine suffisent',
  "Passion pour l'animation japonaise et envie d'apprendre",
  "Rigueur et respect des délais (on s'organise ensemble)",
  "Bonne communication et esprit d'équipe",
  'Logiciels fournis ou libres — pas besoin d\'investir',
]
</script>

<style scoped>
/* ── Hero ───────────────────────────────────────────────────────── */
.rp-hero {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: linear-gradient(160deg, #081a10 0%, #04070f 60%);
}
.rp-hero-hex {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(60deg,  rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(120deg, rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(0deg,   rgba(var(--color-orange), 0.04) 0, rgba(var(--color-orange), 0.04) 1px, transparent 0, transparent 50%);
  background-size: 40px 40px;
}
.rp-hud { position: absolute; width: 16px; height: 16px; z-index: 2; }
.rp-hud-tl { top: 10px;    left: 10px;  border-top: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.rp-hud-tr { top: 10px;    right: 10px; border-top: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }
.rp-hud-bl { bottom: 10px; left: 10px;  border-bottom: 2px solid rgb(var(--color-orange)); border-left: 2px solid rgb(var(--color-orange)); }
.rp-hud-br { bottom: 10px; right: 10px; border-bottom: 2px solid rgb(var(--color-orange)); border-right: 2px solid rgb(var(--color-orange)); }

.rp-hero-inner {
  position: relative; z-index: 2;
  width: 100%; max-width: 1024px; margin: 0 auto;
  padding: 32px 24px 28px;
}
.rp-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 9px; font-family: 'Courier New', monospace;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: rgb(var(--color-ink-3)); margin-bottom: 10px;
}
.rp-bc-link { color: rgb(var(--color-ink-2)); transition: color 0.15s; }
.rp-bc-link:hover { color: rgb(var(--color-orange)); }
.rp-bc-sep { color: rgb(var(--color-orange)); opacity: 0.45; }

.rp-status {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 8px; font-family: 'Courier New', monospace;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: #22c55e; margin-bottom: 10px;
}
.rp-status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 6px #22c55e;
  animation: rp-pulse 2s ease-in-out infinite;
}
@keyframes rp-pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.35; } }

.rp-hero-title {
  font-size: 28px; font-weight: 900; letter-spacing: 0.06em;
  text-transform: uppercase; color: white; line-height: 1.1; margin-bottom: 6px;
}
.rp-hero-sub { font-size: 12px; color: rgb(var(--color-ink-2)); max-width: 480px; }
.rp-hero-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, rgb(var(--color-orange)), rgba(var(--color-orange), 0.3) 60%, transparent);
}

/* ── Layout ─────────────────────────────────────────────────────── */
.rp-layout {
  max-width: 1024px; margin: 0 auto; padding: 28px 24px;
  display: flex; flex-direction: column; gap: 36px;
}

/* ── Section head ───────────────────────────────────────────────── */
.rp-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.rp-section-mark { width: 3px; height: 16px; background: rgb(var(--color-orange)); box-shadow: 0 0 8px rgba(var(--color-orange), 0.5); flex-shrink: 0; }
.rp-section-count { font-size: 8px; font-family: 'Courier New', monospace; letter-spacing: 0.12em; color: rgb(var(--color-ink-3)); margin-left: auto; }

/* ── Rôles ──────────────────────────────────────────────────────── */
.rp-roles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 10px;
}
.rp-role {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.1);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.rp-role:not(.rp-role--closed):hover {
  border-color: rgba(var(--color-orange), 0.3);
  box-shadow: 0 0 20px rgba(var(--color-orange), 0.06);
}
.rp-role--closed { opacity: 0.45; }
.rp-role-top { height: 2px; background: rgba(var(--color-orange), 0.4); transition: background 0.15s; }
.rp-role:not(.rp-role--closed):hover .rp-role-top { background: rgb(var(--color-orange)); }
.rp-role-inner { padding: 14px; }

.rp-role-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.rp-role-icon {
  width: 36px; height: 36px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}
.rp-role-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 6px; }
.rp-role-tags  { display: flex; gap: 4px; flex-wrap: wrap; }
.rp-role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 8px; font-family: 'Courier New', monospace;
  letter-spacing: 0.14em; font-weight: 700;
  padding: 2px 7px; flex-shrink: 0;
}
.rp-badge-open   { background: rgba(34,197,94,0.1);  color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }
.rp-badge-closed { background: rgba(255,255,255,0.05); color: rgb(var(--color-ink-3)); border: 1px solid rgba(255,255,255,0.1); }
.rp-badge-dot    { width: 5px; height: 5px; border-radius: 50%; }
.rp-dot-open     { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
.rp-dot-closed   { background: rgb(var(--color-ink-3)); }
.rp-role-desc { font-size: 11px; color: rgb(var(--color-ink-2)); line-height: 1.65; }

/* ── Étapes ─────────────────────────────────────────────────────── */
.rp-steps {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  position: relative;
}
@media (max-width: 640px) { .rp-steps { grid-template-columns: 1fr; } }
.rp-step { position: relative; }
.rp-step-num {
  font-size: 28px; font-weight: 900; font-family: 'Courier New', monospace;
  color: rgb(var(--color-orange)); opacity: 0.6; line-height: 1; margin-bottom: 8px;
}
.rp-step-body {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.1);
  border-top: 2px solid rgba(var(--color-orange), 0.35);
  padding: 14px;
}
.rp-step-title { font-size: 12px; font-weight: 700; color: white; margin-bottom: 6px; letter-spacing: 0.04em; }
.rp-step-desc  { font-size: 11px; color: rgb(var(--color-ink-2)); line-height: 1.65; }

/* ── Ce qu'on attend ────────────────────────────────────────────── */
.rp-requirements {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.12);
  position: relative; overflow: hidden;
}
.rp-req-top { height: 2px; background: rgba(var(--color-orange), 0.45); }
.rp-req-inner { padding: 20px 24px; }
.rp-req-eyebrow {
  font-size: 8px; font-family: 'Courier New', monospace;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: rgb(var(--color-orange)); opacity: 0.75; margin-bottom: 6px;
}
.rp-req-title { font-size: 14px; font-weight: 700; color: white; margin-bottom: 14px; letter-spacing: 0.04em; }
.rp-req-list  { display: flex; flex-direction: column; gap: 8px; list-style: none; }
.rp-req-item  { display: flex; align-items: flex-start; gap: 10px; font-size: 12px; color: rgb(var(--color-ink-2)); line-height: 1.6; }
.rp-req-bullet { color: rgb(var(--color-orange)); font-size: 8px; margin-top: 4px; flex-shrink: 0; }

/* ── CTA Discord ────────────────────────────────────────────────── */
.rp-cta {
  position: relative;
  border: 1px solid rgba(var(--color-orange), 0.2);
  border-top: 2px solid rgba(var(--color-orange), 0.55);
  overflow: hidden;
  text-align: center;
}
.rp-cta-hex {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(60deg,  rgba(var(--color-orange), 0.02) 0, rgba(var(--color-orange), 0.02) 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(120deg, rgba(var(--color-orange), 0.02) 0, rgba(var(--color-orange), 0.02) 1px, transparent 0, transparent 50%);
  background-size: 30px 30px;
  pointer-events: none;
}
.rp-cta-inner { position: relative; z-index: 1; padding: 36px 24px; }
.rp-cta-eyebrow {
  font-size: 8px; font-family: 'Courier New', monospace;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgb(var(--color-orange)); opacity: 0.8; margin-bottom: 8px;
}
.rp-cta-title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: white; margin-bottom: 10px; }
.rp-cta-sub   { font-size: 12px; color: rgb(var(--color-ink-2)); max-width: 400px; margin: 0 auto 22px; line-height: 1.7; }
</style>
