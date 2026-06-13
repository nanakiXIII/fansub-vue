// src/api/index.js
// =============================================
// Point d'entrée unique du dossier API.
// Permet d'importer depuis '@/api' directement
// sans connaître le fichier source.
//
// Exemple d'utilisation dans un composant :
//   import { getSeries, getSerieById } from '@/api'
//   import { login, logout }           from '@/api'
//   import { getEpisodes }             from '@/api'
// =============================================

export * from './series.js'
export * from './episodes.js'
export * from './auth.js'
export * from './search.js'
export * from './user.js'
