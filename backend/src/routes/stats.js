const express        = require('express')
const Stat           = require('../models/Stat')
const News           = require('../models/News')
const Comment        = require('../models/Comment')
const Series         = require('../models/Series')
const WatchProgress  = require('../models/WatchProgress')
const Download       = require('../models/Download')
const UserAchievement = require('../models/UserAchievement')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { checkForUser } = require('../services/achievementChecker')

const router = express.Router()

// POST /api/stats/view
router.post('/view', requireAuth, async (req, res) => {
  const { serieId, serieTitle, episodeNum, episodeTitle, season } = req.body
  if (!serieId) return res.status(400).json({ error: 'serieId requis' })
  await Stat.create({ type: 'view', serieId, serieTitle, episodeNum, episodeTitle, season })
  res.json({ ok: true })
})

// POST /api/stats/download
router.post('/download', requireAuth, async (req, res) => {
  const { serieId, serieTitle, episodeNum, episodeTitle, season } = req.body
  if (!serieId) return res.status(400).json({ error: 'serieId requis' })
  await Stat.create({ type: 'download', serieId, serieTitle, episodeNum, episodeTitle, season })
  if (req.user?._id) checkForUser(req.user._id).catch(() => {})
  res.json({ ok: true })
})

// GET /api/stats — agrégation admin
router.get('/', requireAuth, requirePermission('stats.view'), async (_req, res) => {
  const [
    totalViews,
    totalDownloads,
    topSeriesViews,
    topEpisodesViews,
    topEpisodesDownloads,
    topSeriesDownloads,
  ] = await Promise.all([
    Stat.countDocuments({ type: 'view' }),
    Stat.countDocuments({ type: 'download' }),
    Stat.aggregate([
      { $match: { type: 'view' } },
      { $group: { _id: '$serieId', title: { $first: '$serieTitle' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Stat.aggregate([
      { $match: { type: 'view' } },
      { $group: {
        _id: { serieId: '$serieId', episodeNum: '$episodeNum' },
        serieTitle:   { $first: '$serieTitle' },
        episodeTitle: { $first: '$episodeTitle' },
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Stat.aggregate([
      { $match: { type: 'download' } },
      { $group: {
        _id: { serieId: '$serieId', episodeNum: '$episodeNum' },
        serieTitle:   { $first: '$serieTitle' },
        episodeTitle: { $first: '$episodeTitle' },
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Stat.aggregate([
      { $match: { type: 'download' } },
      { $group: { _id: '$serieId', title: { $first: '$serieTitle' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ])

  const [
    totalWatched, totalWatchedCompleted, totalMemberDownloads, totalAchievements,
    topSeriesWatched, topSeriesDownloadedByMembers,
  ] = await Promise.all([
    WatchProgress.countDocuments(),
    WatchProgress.countDocuments({ pct: { $gte: 90 } }),
    Download.countDocuments(),
    UserAchievement.countDocuments(),
    WatchProgress.aggregate([
      { $group: { _id: '$serieId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Download.aggregate([
      { $group: { _id: '$serieId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ])

  // Enrichir avec les titres de séries
  const Series = require('../models/Series')
  const allSerieIds = [
    ...topSeriesWatched.map(r => r._id),
    ...topSeriesDownloadedByMembers.map(r => r._id),
  ]
  const seriesDocs = await Series.find({ id: { $in: allSerieIds } }, 'id title').lean()
  const seriesMap  = Object.fromEntries(seriesDocs.map(s => [s.id, s.title]))

  const memberTopSeriesViews     = topSeriesWatched.map(r => ({ _id: r._id, title: seriesMap[r._id] || r._id, count: r.count }))
  const memberTopSeriesDownloads = topSeriesDownloadedByMembers.map(r => ({ _id: r._id, title: seriesMap[r._id] || r._id, count: r.count }))

  res.json({
    totalViews, totalDownloads,
    topSeriesViews, topEpisodesViews, topEpisodesDownloads, topSeriesDownloads,
    totalWatched, totalWatchedCompleted, totalMemberDownloads, totalAchievements,
    memberTopSeriesViews, memberTopSeriesDownloads,
  })
})

// GET /api/stats/series — stats complètes par série (admin)
router.get('/series', requireAuth, requirePermission('stats.view'), async (_req, res) => {
  try {
    const [allSeries, viewCounts, dlCounts] = await Promise.all([
      Series.find({}, 'id title poster status genres episodesAired seasons episodes visible createdAt').lean(),
      Stat.aggregate([
        { $match: { type: 'view' } },
        { $group: { _id: '$serieId', count: { $sum: 1 } } },
      ]),
      Stat.aggregate([
        { $match: { type: 'download' } },
        { $group: { _id: '$serieId', count: { $sum: 1 } } },
      ]),
    ])

    const viewMap = {}
    const dlMap   = {}
    for (const v of viewCounts)  viewMap[v._id] = v.count
    for (const d of dlCounts)    dlMap[d._id]   = d.count

    const rows = allSeries.map(s => {
      const epCount = s.seasons?.length
        ? s.seasons.reduce((a, ss) => a + (ss.episodes?.length || 0), 0)
        : (s.episodes?.length || 0)
      return {
        _id:           s._id,
        serieId:       s.id,
        title:         s.title,
        poster:        s.poster,
        status:        s.status,
        genres:        s.genres || [],
        episodesAired: s.episodesAired || epCount,
        visible:       s.visible,
        views:         viewMap[s.id] || 0,
        downloads:     dlMap[s.id]   || 0,
        createdAt:     s.createdAt,
      }
    })

    const totalViews     = rows.reduce((a, r) => a + r.views,     0)
    const totalDownloads = rows.reduce((a, r) => a + r.downloads, 0)

    res.json({ totalViews, totalDownloads, totalSeries: rows.length, rows })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/stats/news — stats des actualités (admin)
router.get('/news', requireAuth, requirePermission('stats.view'), async (_req, res) => {
  try {
    const [articles, commentCounts] = await Promise.all([
      News.find({}, 'title category icon published views createdAt').sort({ views: -1, createdAt: -1 }).lean(),
      Comment.aggregate([
        { $match: { articleId: { $ne: null } } },
        { $group: { _id: '$articleId', count: { $sum: 1 } } },
      ]),
    ])

    const countMap = {}
    for (const c of commentCounts) countMap[c._id.toString()] = c.count

    const totalViews    = articles.reduce((a, n) => a + (n.views || 0), 0)
    const totalComments = commentCounts.reduce((a, c) => a + c.count, 0)

    const rows = articles.map(a => ({
      _id:          a._id,
      title:        a.title,
      category:     a.category,
      icon:         a.icon,
      published:    a.published,
      views:        a.views || 0,
      comments:     countMap[a._id.toString()] || 0,
      createdAt:    a.createdAt,
    }))

    res.json({ totalViews, totalComments, totalArticles: articles.length, rows })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/stats/comments — stats des commentaires (admin)
router.get('/comments', requireAuth, requirePermission('stats.view'), async (_req, res) => {
  try {
    const [total, pending, approved, rejected, perSerie, perArticle] = await Promise.all([
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending'  }),
      Comment.countDocuments({ status: 'approved' }),
      Comment.countDocuments({ status: 'rejected' }),
      Comment.aggregate([
        { $match: { serieId: { $ne: null } } },
        { $group: { _id: '$serieId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Comment.aggregate([
        { $match: { articleId: { $ne: null } } },
        { $group: { _id: '$articleId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ])

    // Enrichit perSerie avec les titres de séries
    const serieIds = perSerie.map(r => r._id)
    const series   = await Series.find({ id: { $in: serieIds } }, 'id title poster').lean()
    const serieMap = Object.fromEntries(series.map(s => [s.id, s]))

    // Enrichit perArticle avec les titres d'articles
    const articleIds = perArticle.map(r => r._id)
    const articles   = await News.find({ _id: { $in: articleIds } }, 'title icon').lean()
    const articleMap = Object.fromEntries(articles.map(a => [a._id.toString(), a]))

    res.json({
      total, pending, approved, rejected,
      perSerie: perSerie.map(r => ({
        serieId: r._id,
        title:   serieMap[r._id]?.title  ?? r._id,
        poster:  serieMap[r._id]?.poster ?? null,
        count:   r.count,
      })),
      perArticle: perArticle.map(r => ({
        articleId: r._id,
        title:     articleMap[r._id.toString()]?.title ?? '—',
        icon:      articleMap[r._id.toString()]?.icon  ?? '',
        count:     r.count,
      })),
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/stats/membres — stats par membre (admin)
router.get('/membres', requireAuth, requirePermission('stats.view'), async (_req, res) => {
  try {
    const User = require('../models/User')

    const [watchCounts, dlCounts, achievCounts, users] = await Promise.all([
      WatchProgress.aggregate([
        { $group: { _id: '$userId', watched: { $sum: 1 }, completed: { $sum: { $cond: [{ $gte: ['$pct', 90] }, 1, 0] } } } },
      ]),
      Download.aggregate([
        { $group: { _id: '$userId', downloads: { $sum: 1 } } },
      ]),
      UserAchievement.aggregate([
        { $group: { _id: '$userId', achievements: { $sum: 1 } } },
      ]),
      User.find({}, 'username avatar isAdmin createdAt').lean(),
    ])

    const watchMap  = Object.fromEntries(watchCounts.map(r => [String(r._id),  r]))
    const dlMap     = Object.fromEntries(dlCounts.map(r    => [String(r._id),  r]))
    const achievMap = Object.fromEntries(achievCounts.map(r => [String(r._id), r]))

    const rows = users.map(u => {
      const id = String(u._id)
      return {
        _id:          u._id,
        username:     u.username,
        avatar:       u.avatar,
        isAdmin:      u.isAdmin,
        createdAt:    u.createdAt,
        watched:      watchMap[id]?.watched      ?? 0,
        completed:    watchMap[id]?.completed    ?? 0,
        downloads:    dlMap[id]?.downloads       ?? 0,
        achievements: achievMap[id]?.achievements ?? 0,
      }
    })

    const top10Watchers   = [...rows].sort((a, b) => b.watched   - a.watched).slice(0, 10)
    const top10Downloaders = [...rows].sort((a, b) => b.downloads - a.downloads).slice(0, 10)

    res.json({ rows, top10Watchers, top10Downloaders })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
