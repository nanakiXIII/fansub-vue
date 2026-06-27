<template>
  <footer class="gf-footer">

    <!-- Barre top -->
    <div class="gf-topbar" aria-hidden="true">
      <div class="gf-topbar-fill"></div>
      <div class="gf-topbar-stripe"></div>
      <div class="gf-topbar-end"></div>
    </div>

    <div class="gf-inner">

      <!-- Grille principale -->
      <div class="gf-grid">

        <!-- Brand -->
        <div class="gf-brand">
          <div class="gf-logo">
            <div class="gf-emblem">
              <svg class="w-3 h-3 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
            </div>
            <span class="gf-site-name">{{ config.siteName }}</span>
          </div>
          <p class="gf-tagline">
            Sous-titres français par la communauté.<br>Aucune affiliation officielle.
          </p>
          <!-- Réseaux -->
          <div class="gf-socials">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="gf-social-btn"
              :aria-label="social.label"
            >
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path :d="social.icon"/>
              </svg>
            </a>
          </div>
          <!-- Statut système -->
          <div class="gf-sys-status">
            <span class="gf-sys-dot"></span>
            <span class="gf-sys-label">SYSTÈMES OPÉRATIONNELS</span>
          </div>
        </div>

        <!-- Colonnes de liens -->
        <div
          v-for="col in linkColumns"
          :key="col.title"
          class="gf-col"
        >
          <div class="gf-col-title">{{ col.title }}</div>
          <ul class="gf-links">
            <li v-for="link in col.links" :key="link.label">
              <RouterLink v-if="link.to" :to="link.to" class="gf-link">{{ link.label }}</RouterLink>
              <a v-else :href="link.href" target="_blank" rel="noopener noreferrer" class="gf-link">{{ link.label }}</a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Barre de séparation -->
      <div class="gf-divider"></div>

      <!-- Bas de page -->
      <div class="gf-bottom">
        <span class="gf-copy">
          © {{ config.siteYear }} {{ config.siteName }} — Projet fan, aucune affiliation officielle avec les ayants droit.
        </span>
        <div class="gf-legal">
          <span
            v-for="l in legalLinks"
            :key="l"
            class="gf-legal-link"
          >{{ l }}</span>
        </div>
        <span class="gf-build">BUILD {{ buildId }} // MOBILE SUIT FANSUB</span>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { config } from '@/config.js'

const buildId = new Date().getFullYear() + '.' + String(new Date().getMonth() + 1).padStart(2, '0')

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
      { label: "L'équipe",    to: '/equipe'           },
      { label: 'Recrutement', to: '/recrutement'      },
      { label: 'Discord',     href: config.discordUrl },
      { label: 'Twitter / X', href: config.twitterUrl },
      { label: 'GitHub',      href: config.githubUrl  },
    ],
  },
]

const legalLinks = ['Mentions légales', 'CGU', 'Confidentialité', 'Cookies']
</script>

<style scoped>
/* ── Shell ──────────────────────────────────────────────────────── */
.gf-footer {
  margin-top: 48px;
  background: rgba(4, 7, 15, 0.98);
  position: relative;
}

/* Barre top accent */
.gf-topbar {
  display: flex;
  height: 3px;
  gap: 4px;
}
.gf-topbar-fill   { flex: 1; background: rgb(var(--color-orange)); }
.gf-topbar-stripe {
  width: 64px; flex-shrink: 0;
  background: repeating-linear-gradient(
    90deg,
    rgb(var(--color-orange)) 0px,
    rgb(var(--color-orange)) 5px,
    rgba(var(--color-orange), 0.15) 5px,
    rgba(var(--color-orange), 0.15) 9px
  );
}
.gf-topbar-end { width: 20px; background: rgb(var(--color-orange)); }

.gf-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 36px 24px 24px;
}

/* ── Grille ─────────────────────────────────────────────────────── */
.gf-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 32px;
}

/* ── Brand ──────────────────────────────────────────────────────── */
.gf-brand { display: flex; flex-direction: column; gap: 14px; }

.gf-logo { display: flex; align-items: center; gap: 10px; }
.gf-emblem {
  width: 30px; height: 30px;
  background: rgb(var(--color-orange));
  display: flex; align-items: center; justify-content: center;
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
  filter: drop-shadow(0 0 6px rgba(var(--color-orange), 0.5));
}
.gf-site-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: white;
}
.gf-tagline {
  font-size: 11px;
  color: rgb(var(--color-ink-3));
  line-height: 1.65;
  max-width: 220px;
}

/* Réseaux sociaux */
.gf-socials { display: flex; gap: 8px; }
.gf-social-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  color: rgb(var(--color-ink-3));
  background: rgba(var(--color-orange), 0.05);
  border: 1px solid rgba(var(--color-orange), 0.14);
  transition: all 0.15s;
}
.gf-social-btn:hover {
  color: rgb(var(--color-orange));
  background: rgba(var(--color-orange), 0.1);
  border-color: rgba(var(--color-orange), 0.35);
}

/* Statut système */
.gf-sys-status { display: flex; align-items: center; gap: 7px; }
.gf-sys-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: gf-pulse 2.5s ease-in-out infinite;
}
@keyframes gf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.gf-sys-label {
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(var(--color-ink-3));
}

/* ── Colonnes liens ─────────────────────────────────────────────── */
.gf-col {}
.gf-col-title {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--color-orange));
  opacity: 0.75;
  margin-bottom: 12px;
}
.gf-col-title::before { content: '// '; opacity: 0.5; }
.gf-links { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.gf-link {
  display: block;
  font-size: 11px;
  color: rgb(var(--color-ink-3));
  padding: 3px 0 3px 8px;
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s, padding-left 0.15s;
}
.gf-link:hover {
  color: rgb(var(--color-ink-1));
  border-left-color: rgb(var(--color-orange));
  padding-left: 12px;
}

/* ── Séparateur ─────────────────────────────────────────────────── */
.gf-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(var(--color-orange), 0.3), rgba(var(--color-orange), 0.06) 60%, transparent);
  margin-bottom: 20px;
}

/* ── Bas de page ────────────────────────────────────────────────── */
.gf-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.gf-copy {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  color: rgb(var(--color-ink-3));
  letter-spacing: 0.04em;
}
.gf-legal { display: flex; gap: 16px; }
.gf-legal-link {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  color: rgb(var(--color-ink-3));
  cursor: pointer;
  transition: color 0.15s;
  letter-spacing: 0.04em;
}
.gf-legal-link:hover { color: rgb(var(--color-orange)); }
.gf-build {
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--color-orange));
  opacity: 0.45;
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .gf-grid { grid-template-columns: 1fr 1fr; }
  .gf-brand { grid-column: 1 / -1; }
  .gf-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
  .gf-build { display: none; }
}
</style>
