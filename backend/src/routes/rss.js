const express = require('express')
const News    = require('../models/News')

const router = express.Router()

const SITE_URL  = (process.env.SITE_URL ?? 'https://chuushin.fr').replace(/\/$/, '')
const SITE_NAME = process.env.SITE_NAME ?? 'Fansub'

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

// GET /rss.xml — flux RSS 2.0 des actualités publiées (20 dernières)
router.get('/', async (_req, res) => {
  try {
    const news = await News.find({ published: true }).sort({ createdAt: -1 }).limit(20).lean()

    const items = news.map(n => {
      const url = `${SITE_URL}/actualite/${n._id}`
      const description = n.excerpt || n.content?.[0] || ''
      return `
  <item>
    <title>${escapeXml(n.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(n.createdAt).toUTCString()}</pubDate>
    ${n.author ? `<author>${escapeXml(n.author)}</author>` : ''}
    <description>${escapeXml(description)}</description>
  </item>`
    }).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_NAME)} — Actualités</title>
  <link>${SITE_URL}/actualites</link>
  <description>Dernières actualités de ${escapeXml(SITE_NAME)}</description>
  <language>fr</language>${items}
</channel>
</rss>`

    res.set('Content-Type', 'application/rss+xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    res.status(500).send('<!-- rss error -->')
  }
})

module.exports = router
