const express    = require('express')
const Series     = require('../models/Series')
const InProgress = require('../models/InProgress')
const Release    = require('../models/Release')
const News       = require('../models/News')
const User       = require('../models/User')
const { optionalAuth } = require('../middleware/auth')
const { findEpisode }  = require('../utils/episodeLookup')

const router = express.Router()

function canPreview(req) {
  const p = req.userPermissions ?? []
  return p.includes('*') || p.includes('content.preview')
}

// GET /api/home — retourne toutes les données nécessaires pour la home en une requête
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const preview = canPreview(req)

    const inProgressFilter = preview ? {} : { visible: true }
    const seriesFilter     = preview ? {} : { visible: { $ne: false } }

    const [inProgressDocs, releaseDocs, newsDocs, seriesCount, memberCount, seriesAll] = await Promise.all([
      InProgress.find(inProgressFilter).sort({ order: 1, createdAt: 1 }),
      Release.find().sort({ releasedAt: -1 }).limit(30),
      News.find(preview ? {} : { published: true }).sort({ createdAt: -1 }).limit(5),
      Series.countDocuments(seriesFilter),
      User.countDocuments(),
      Series.find(seriesFilter, 'id title titleFull titleJP season poster banner gradient status year studio score genres episodes seasons episodesAired'),
    ])

    // Index séries par id pour jointures rapides
    const seriesMap = {}
    for (const s of seriesAll) {
      seriesMap[s.id] = s
    }

    // Calcul du total d'épisodes et de saisons
    const totalEpisodes = seriesAll.reduce((acc, s) => {
      if (s.seasons?.length) {
        return acc + s.seasons.reduce((a, season) => a + (season.episodes?.length ?? 0), 0)
      }
      return acc + (s.episodes?.length ?? 0)
    }, 0)
    const totalSeasons = seriesAll.reduce((acc, s) => acc + (s.seasons?.length ?? 0), 0)

    // Carrousel : inProgress jointé avec sa série
    const carousel = inProgressDocs.map(doc => {
      const serie = seriesMap[doc.serieId]
      if (!serie) return null
      const serieObj = {
        id:        serie.id,
        title:     serie.title,
        titleFull: serie.titleFull,
        titleJp:   serie.titleJP,   // renommage pour compat frontend (lowercase p)
        season:    serie.season,
        poster:    serie.poster,
        banner:    serie.banner,
        gradient:  serie.gradient,
        score:     serie.score,
        year:      serie.year,
        studio:    serie.studio,
        genres:    serie.genres,
        status:    serie.status,
      }
      return { ...doc.toObject(), serie: serieObj }
    }).filter(Boolean)

    // Releases : 6 dernières jointes avec leurs séries + épisode + dateLabel + isNew
    // On filtre les épisodes masqués et on prend les 6 premiers visibles
    const releases = releaseDocs.map(r => {
      const serie = seriesMap[r.serieId]
      if (!serie) return null

      const episode = findEpisode(serie, r.seasonSlug, r.epNum)

      const tz = 'Europe/Paris'
      const calFmt = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }
      const todayStr   = new Date().toLocaleDateString('en-CA', calFmt)
      const releaseStr = new Date(r.releasedAt).toLocaleDateString('en-CA', calFmt)
      const diffDays = Math.round((new Date(todayStr) - new Date(releaseStr)) / 86400000)
      const dateLabel = diffDays === 0
        ? "Aujourd'hui"
        : diffDays === 1
          ? 'Hier'
          : new Date(r.releasedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: tz })
      const isNew = diffDays < 7

      const serieObj = {
        id:       serie.id,
        title:    serie.title,
        poster:   serie.poster,
        gradient: serie.gradient,
      }

      const episodeObj = episode ? episode.toObject?.() ?? episode : null
      if (episodeObj?.visible === false) return null

      return { ...r.toObject(), serie: serieObj, episode: episodeObj, dateLabel, isNew }
    }).filter(Boolean).slice(0, 6)

    // Stats
    const stats = {
      series:     seriesCount,
      episodes:   totalEpisodes,
      seasons:    totalSeasons,
      team:       memberCount,
      inProgress: inProgressDocs.length,
    }

    // News enrichies avec les données de la série liée
    const news = newsDocs.map(n => {
      const obj = n.toObject()
      if (n.serieId && seriesMap[n.serieId]) {
        const s = seriesMap[n.serieId]
        obj.serie = { id: s.id, title: s.title, banner: s.banner, poster: s.poster, gradient: s.gradient }
      }
      return obj
    })

    res.json({ carousel, releases, news, stats })
  } catch (err) { next(err) }
})

module.exports = router
