// src/config.js
// =============================================
// Point d'entrée unique pour toute la config.
// Importez ce fichier plutôt qu'appeler
// import.meta.env directement dans les composants.
// =============================================

export const config = {
  // Identité du site
  siteName        : import.meta.env.VITE_SITE_NAME        ?? 'FansubZen',
  siteTagline     : import.meta.env.VITE_SITE_TAGLINE     ?? '',
  siteYear        : import.meta.env.VITE_SITE_YEAR        ?? new Date().getFullYear(),
  siteUrl         : (import.meta.env.VITE_SITE_URL        ?? '').replace(/\/$/, ''),
  siteDescription : import.meta.env.VITE_SITE_DESCRIPTION ?? '',

  // API
  apiBaseUrl  : import.meta.env.VITE_API_BASE_URL  ?? '/api',

  // Réseaux sociaux
  discordUrl  : import.meta.env.VITE_DISCORD_URL   ?? '#',
  twitterUrl  : import.meta.env.VITE_TWITTER_URL   ?? '#',
  githubUrl   : import.meta.env.VITE_GITHUB_URL    ?? '#',
}
