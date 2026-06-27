<template>
  <footer class="flux-footer mt-12">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Top row -->
      <div class="flex items-start justify-between flex-wrap gap-6 mb-6">
        <!-- Brand -->
        <div>
          <RouterLink to="/" class="flux-footer-brand inline-block mb-2 hover:opacity-80 transition-opacity">{{ config.siteName }}</RouterLink>
          <p class="text-[11px] max-w-[200px] leading-relaxed" style="color:rgba(245,242,255,0.28);">
            Sous-titres français par la communauté. Aucune affiliation officielle.
          </p>
          <!-- Social links -->
          <div class="flex gap-2.5 mt-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flux-social-btn w-8 h-8 rounded-lg flex items-center justify-center"
              :aria-label="social.label"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path :d="social.icon"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Links columns -->
        <div class="flex gap-10 flex-wrap">
          <div v-for="col in linkColumns" :key="col.title">
            <div class="flux-col-title text-[10px] font-bold uppercase tracking-widest mb-3">{{ col.title }}</div>
            <ul class="flex flex-col gap-2">
              <li v-for="link in col.links" :key="link.label">
                <RouterLink
                  v-if="link.to"
                  :to="link.to"
                  class="flux-footer-link text-[11px] transition-colors"
                >{{ link.label }}</RouterLink>
                <a
                  v-else
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flux-footer-link text-[11px] transition-colors"
                >{{ link.label }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="flux-footer-bottom pt-4 flex items-center justify-between flex-wrap gap-2">
        <span class="text-[10px]" style="color:rgba(245,242,255,0.2);">© {{ config.siteYear }} {{ config.siteName }} — Projet fan, aucune affiliation officielle avec les ayants droit.</span>
        <div class="flex gap-4">
          <span v-for="l in legalLinks" :key="l" class="text-[10px]" style="color:rgba(245,242,255,0.18);">{{ l }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { config } from '@/config.js'

const socials = [
  {
    label: 'Discord',
    url: config.discordUrl,
    icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z',
  },
  {
    label: 'Twitter / X',
    url: config.twitterUrl,
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'GitHub',
    url: config.githubUrl,
    icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z',
  },
]

const linkColumns = [
  {
    title: 'Navigation',
    links: [
      { label: 'Accueil',           to: '/'          },
      { label: 'Catalogue',         to: '/catalogue' },
      { label: 'Dernières sorties', to: '/sorties'   },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: 'Mon profil',  to: '/profil'      },
      { label: 'Connexion',   to: '/connexion'   },
      { label: 'Inscription', to: '/inscription' },
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'L\'équipe',    to: '/equipe'           },
      { label: 'Recrutement',  to: '/recrutement'      },
      { label: 'Discord',      href: config.discordUrl },
      { label: 'Twitter / X',  href: config.twitterUrl },
      { label: 'GitHub',       href: config.githubUrl  },
    ],
  },
]

const legalLinks = ['Mentions légales', 'CGU', 'Politique de confidentialité', 'Cookies']
</script>

<style scoped>
.flux-footer {
  background: rgba(14,12,31,0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.06);
  position: relative;
  z-index: 1;
}

.flux-footer-brand {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(90deg, #c084fc, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.flux-col-title {
  background: linear-gradient(90deg, #c084fc, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.flux-footer-link {
  color: rgba(245,242,255,0.3);
}
.flux-footer-link:hover {
  color: rgba(245,242,255,0.75);
}

.flux-social-btn {
  color: rgba(245,242,255,0.35);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.2s;
}
.flux-social-btn:hover {
  color: rgba(245,242,255,0.9);
  background: rgba(192,132,252,0.08);
  border-color: rgba(192,132,252,0.2);
  box-shadow: 0 0 14px rgba(168,85,247,0.2);
}

.flux-footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.05);
}
</style>
