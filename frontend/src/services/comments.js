import { http } from './http.js'

function qs(params) {
  return '?' + Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

export const commentsService = {
  getByArticle: (articleId, admin = false, page = 1) =>
    http.get('/comments' + qs({ articleId, ...(admin ? { admin: 1 } : {}), page })),

  getBySerie: (serieId, admin = false, page = 1) =>
    http.get('/comments' + qs({ serieId, epNum: 'null', ...(admin ? { admin: 1 } : {}), page })),

  getByEpisode: (serieId, epNum, admin = false, page = 1) =>
    http.get('/comments' + qs({ serieId, epNum, ...(admin ? { admin: 1 } : {}), page })),

  post:       (payload) => http.post('/comments', payload),
  approve:    (id)      => http.patch(`/comments/${id}/approve`),
  reject:     (id)      => http.patch(`/comments/${id}/reject`),
  disapprove: (id)      => http.patch(`/comments/${id}/disapprove`),
  delete:     (id)      => http.delete(`/comments/${id}`),
}
