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

// GET /api/analytics/summary?month=YYYY-MM — admin
// `month` sélectionne le mois calendaire affiché par le graphique journalier (par défaut : mois en cours).
router.get('/summary', requireAuth, requirePermission('analytics.view'), async (req, res, next) => {
  try {
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo  = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)

    // Mois calendaire sélectionné (borné au mois en cours si une date future est demandée)
    const monthParam = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : null
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const selectedMonth = monthParam && monthParam <= currentMonthKey ? monthParam : currentMonthKey
    const [selYear, selMonthNum] = selectedMonth.split('-').map(Number)
    const monthStart = new Date(selYear, selMonthNum - 1, 1)
    const monthEnd   = new Date(selYear, selMonthNum, 1)

    const uniqueCount = (match) => PageView.aggregate([
      { $match: { sessionId: { $ne: null }, ...match } },
      { $group: { _id: '$sessionId' } },
      { $count: 'n' },
    ]).then(r => r[0]?.n ?? 0)

    const [
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      totalUnique,
      todayUnique,
      weekUnique,
      monthUnique,
      firstPageView,
      daily,
      dailyUnique,
      monthly,
      monthlyUnique,
      topPages,
      topCountries,
      topSources,
    ] = await Promise.all([
      PageView.countDocuments(),
      PageView.countDocuments({ createdAt: { $gte: today } }),
      PageView.countDocuments({ createdAt: { $gte: weekAgo } }),
      PageView.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } }),
      uniqueCount({}),
      uniqueCount({ createdAt: { $gte: today } }),
      uniqueCount({ createdAt: { $gte: weekAgo } }),
      uniqueCount({ createdAt: { $gte: monthStart, $lt: monthEnd } }),
      PageView.findOne().sort({ createdAt: 1 }).select('createdAt').lean(),

      // Mois sélectionné — vues par jour
      PageView.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lt: monthEnd } } },
        { $group: {
          _id: { d: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.d': 1 } },
      ]),

      // Mois sélectionné — visiteurs uniques par jour
      PageView.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lt: monthEnd }, sessionId: { $ne: null } } },
        { $group: { _id: { d: { $dayOfMonth: '$createdAt' }, s: '$sessionId' } } },
        { $group: { _id: { d: '$_id.d' }, count: { $sum: 1 } } },
        { $sort: { '_id.d': 1 } },
      ]),

      // Depuis le début — vues par mois
      PageView.aggregate([
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),

      // Depuis le début — visiteurs uniques par mois
      PageView.aggregate([
        { $match: { sessionId: { $ne: null } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, s: '$sessionId' } } },
        { $group: { _id: { y: '$_id.y', m: '$_id.m' }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
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

    // Graphique journalier : un point par jour du mois sélectionné (28 à 31 selon le mois)
    const dailyMap       = Object.fromEntries(daily.map(d       => [d._id.d, d.count]))
    const dailyUniqueMap = Object.fromEntries(dailyUnique.map(d => [d._id.d, d.count]))
    const daysInMonth = monthEnd.getTime() === new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
      ? now.getDate() // mois en cours : s'arrête à aujourd'hui plutôt que de projeter des jours futurs à 0
      : new Date(selYear, selMonthNum, 0).getDate()
    const dailyChart = []
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${selYear}-${String(selMonthNum).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      dailyChart.push({ date: key, count: dailyMap[day] ?? 0, unique: dailyUniqueMap[day] ?? 0 })
    }

    // Graphique mensuel : un point par mois, depuis le tout premier enregistrement
    const monthlyMap       = Object.fromEntries(monthly.map(m       => [`${m._id.y}-${String(m._id.m).padStart(2,'0')}`, m.count]))
    const monthlyUniqueMap = Object.fromEntries(monthlyUnique.map(m => [`${m._id.y}-${String(m._id.m).padStart(2,'0')}`, m.count]))
    const monthlyChart = []
    if (firstPageView) {
      const start = new Date(firstPageView.createdAt)
      let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
      const end  = new Date(now.getFullYear(), now.getMonth(), 1)
      while (cursor <= end) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`
        monthlyChart.push({ month: key, count: monthlyMap[key] ?? 0, unique: monthlyUniqueMap[key] ?? 0 })
        cursor.setMonth(cursor.getMonth() + 1)
      }
    }

    res.json({
      totalViews, todayViews, weekViews, monthViews,
      totalUnique, todayUnique, weekUnique, monthUnique,
      selectedMonth,
      firstMonth: monthlyChart[0]?.month ?? currentMonthKey,
      dailyChart,
      monthlyChart,
      topPages:     topPages.map(p => ({ path: p._id, pageType: p.pageType, count: p.count })),
      topCountries: topCountries.map(c => ({ country: c._id, count: c.count })),
      topSources:   topSources.map(s => ({ source: s._id, count: s.count })),
    })
  } catch (err) { next(err) }
})

module.exports = router
