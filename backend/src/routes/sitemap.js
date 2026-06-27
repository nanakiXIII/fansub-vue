const express = require('express')
const Series  = require('../models/Series')
const News    = require('../models/News')

const router = express.Router()

const SITE_URL = (process.env.SITE_URL ?? 'https://chuushin.fr').replace(/\/$/, '')

function loc(path)     { return `<loc>${SITE_URL}${path}</loc>` }
function lastmod(date) { return date ? `<lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>` : '' }

const STATIC = [
  { path: '/',            changefreq: 'daily',   priority: '1.0' },
  { path: '/catalogue',  changefreq: 'daily',   priority: '0.9' },
  { path: '/actualites', changefreq: 'weekly',  priority: '0.8' },
  { path: '/sorties',    changefreq: 'daily',   priority: '0.8' },
  { path: '/equipe',     changefreq: 'monthly', priority: '0.5' },
  { path: '/recrutement',changefreq: 'monthly', priority: '0.5' },
]

router.get('/', async (_req, res) => {
  try {
    const [series, news] = await Promise.all([
      Series.find({ visible: true }, 'id updatedAt').lean(),
      News.find({ published: true }, '_id updatedAt').lean(),
    ])

    const staticUrls = STATIC.map(p => `
  <url>
    ${loc(p.path)}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

    const serieUrls = series.map(s => `
  <url>
    ${loc(`/serie/${s.id}`)}
    ${lastmod(s.updatedAt)}
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')

    const newsUrls = news.map(n => `
  <url>
    ${loc(`/actualite/${n._id}`)}
    ${lastmod(n.updatedAt)}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${serieUrls}
${newsUrls}
</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(xml)
  } catch (err) {
    res.status(500).send('<!-- sitemap error -->')
  }
})

module.exports = router
