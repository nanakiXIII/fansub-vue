import { http } from './http.js'

export const userSync = {
  fetchAll:       ()                                          => http.get('/user/all'),
  addFavorite:    (serieId)                                   => http.post('/user/favorites', { serieId }),
  removeFavorite: (serieId)                                   => http.delete(`/user/favorites/${serieId}`),
  updateProgress: (serieId, seasonSlug, epNum, pct)          => http.put('/user/progress', { serieId, seasonSlug, epNum, pct }),
  clearHistory:   ()                                          => http.delete('/user/progress/history'),
  addDownload:    (serieId, seasonSlug, epNum, quality, lang) => http.post('/user/downloads', { serieId, seasonSlug, epNum, quality, lang }),
  clearDownloads: ()                                          => http.delete('/user/downloads'),
}
