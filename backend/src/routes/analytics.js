const express  = require('express')
const PageView = require('../models/PageView')
const { requireAuth, requirePermission } = require('../middleware/auth')

let geoip = null
try { geoip = require('geoip-lite') } catch {}

const router = express.Router()

// ── Parsing referrer ──────────────────────────────────────────────
const SOURCE_MAP = [
  { match: /google\./i,           label: 'Google'     },
  { match: /bing\.com/i,          label: 'Bing'       },
  { match: /(twitter|x)\.com/i,   label: 'Twitter / X'},
  { match: /facebook\.com/i,      label: 'Facebook'   },
  { match: /youtube\.com/i,       label: 'YouTube'    },
  { match: /reddit\.com/i,        label: 'Reddit'     },
  { match: /discord\.(com|gg)/i,  label: 'Discord'    },
  { match: /instagram\.com/i,     label: 'Instagram'  },
  { match: /tiktok\.com/i,        label: 'TikTok'     },
]

function parseSource(referrer) {
  if (!referrer) return 'Direct'
  try {
    const host = new URL(referrer).hostname
    const found = SOURCE_MAP.find(s => s.match.test(host))
    return found ? found.label : host.replace(/^www\./, '')
  } catch {
    return 'Direct'
  }
}

function getIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || null
}

function getCountry(ip) {
  if (!geoip || !ip) return null
  try {
    const geo = geoip.lookup(ip)
    return geo?.country ?? null
  } catch { return null }
}

// POST /api/analytics/pageview — public, enregistre une visite
router.post('/pageview', async (req, res) => {
  try {
    const { path, pageType, pageId, referrer, sessionId } = req.body
    if (!path) return res.status(400).json({ error: 'path requis' })

    const ip      = getIp(req)
    const country = getCountry(ip)
    const source  = parseSource(referrer)

    await PageView.create({ path, pageType: pageType || 'other', pageId: pageId || null, source, country, sessionId: sessionId || null })
    res.json({ ok: true })
  } catch { res.json({ ok: true }) } // silencieux côté client
})

// GET /api/analytics/summary — admin
router.get('/summary', requireAuth, requirePermission('analytics.view'), async (req, res, next) => {
  try {
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo  = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30)

    const uniqueCount = (match) => PageView.aggregate([
      { $match: { sessionId: { $ne: null }, ...match } },
      { $group: { _id: '$sessionId' } },
      { $count: 'n' },
    ]).then(r => r[0]?.n ?? 0)

    const [
      totalViews,
      todayViews,
      weekViews,
      totalUnique,
      todayUnique,
      weekUnique,
      daily,
      dailyUnique,
      topPages,
      topCountries,
      topSources,
    ] = await Promise.all([
      PageView.countDocuments(),
      PageView.countDocuments({ createdAt: { $gte: today } }),
      PageView.countDocuments({ createdAt: { $gte: weekAgo } }),
      uniqueCount({}),
      uniqueCount({ createdAt: { $gte: today } }),
      uniqueCount({ createdAt: { $gte: weekAgo } }),

      // 30 derniers jours — vues
      PageView.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ]),

      // 30 derniers jours — visiteurs uniques
      PageView.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, sessionId: { $ne: null } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' }, s: '$sessionId' } } },
        { $group: { _id: { y: '$_id.y', m: '$_id.m', d: '$_id.d' }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ]),

      PageView.aggregate([
        { $group: { _id: '$path', pageType: { $first: '$pageType' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      PageView.aggregate([
        { $match: { country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      PageView.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ])

    // Formater les jours pour un graphique (30 entrées)
    const dailyMap       = {}
    const dailyUniqueMap = {}
    for (const d of daily)       { const k = `${d._id.y}-${String(d._id.m).padStart(2,'0')}-${String(d._id.d).padStart(2,'0')}`; dailyMap[k]       = d.count }
    for (const d of dailyUnique) { const k = `${d._id.y}-${String(d._id.m).padStart(2,'0')}-${String(d._id.d).padStart(2,'0')}`; dailyUniqueMap[k] = d.count }

    const dailyChart = []
    for (let i = 29; i >= 0; i--) {
      const d   = new Date(today); d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      dailyChart.push({ date: key, count: dailyMap[key] ?? 0, unique: dailyUniqueMap[key] ?? 0 })
    }

    res.json({
      totalViews, todayViews, weekViews,
      totalUnique, todayUnique, weekUnique,
      dailyChart,
      topPages:     topPages.map(p => ({ path: p._id, pageType: p.pageType, count: p.count })),
      topCountries: topCountries.map(c => ({ country: c._id, count: c.count })),
      topSources:   topSources.map(s => ({ source: s._id, count: s.count })),
    })
  } catch (err) { next(err) }
})

module.exports = router
