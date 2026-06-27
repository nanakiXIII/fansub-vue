const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/'

export const tmdbKey = import.meta.env.VITE_TMDB_API_KEY || ''

export function tmdbImg(path, size = 'w300') {
  return path ? `${TMDB_IMG}${size}${path}` : ''
}

// Recherche multi (films + séries), ignore les résultats "person".
export async function searchTmdbMulti(query) {
  if (!query?.trim() || !tmdbKey) return []
  const url = `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&language=fr-FR&page=1&api_key=${tmdbKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erreur TMDB')
  const data = await res.json()
  return (data.results ?? [])
    .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
    .map(r => ({
      tmdbId:     r.id,
      mediaType:  r.media_type,
      title:      r.media_type === 'movie' ? r.title : r.name,
      posterPath: tmdbImg(r.poster_path, 'w200'),
      year:       (r.media_type === 'movie' ? r.release_date : r.first_air_date)?.slice(0, 4) ?? '',
    }))
    .slice(0, 8)
}
