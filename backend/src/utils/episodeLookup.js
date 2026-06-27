// Retrouve un épisode dans une série, qu'elle soit organisée par saisons ou par liste plate.
function findEpisode(serie, seasonSlug, epNum) {
  if (serie.seasons?.length) {
    const season = serie.seasons.find(s => s.slug === seasonSlug)
    return season?.episodes?.find(e => e.num === epNum) ?? null
  }
  return serie.episodes?.find(e => e.num === epNum) ?? null
}

module.exports = { findEpisode }
