const express  = require('express')
const mongoose = require('mongoose')
const Series   = require('../models/Series')
const News     = require('../models/News')
const User     = require('../models/User')
const { findEpisode } = require('../utils/episodeLookup')
const { renderMetaHtml } = require('../utils/renderMetaHtml')

// Routes miroir des pages du frontend, montées sous /_preview (cf. backend/src/app.js).
// Caddy/Nginx redirigent ici les requêtes des bots de réseaux sociaux (Discord, Twitter/X,
// Facebook...) qui scrapent un lien sans exécuter le JS — donc sans jamais voir les balises
// posées dynamiquement par useSeo.js côté client. On leur sert à la place du HTML pur avec
// les meta Open Graph déjà remplies à partir des données réelles de la page demandée.

const router = express.Router()

const SITE_URL     = (process.env.SITE_URL ?? 'https://chuushin.fr').replace(/\/$/, '')
const SITE_NAME    = process.env.SITE_NAME ?? 'Fansub'
const DEFAULT_DESC = process.env.SITE_DESCRIPTION ?? `${SITE_NAME} — Sous-titres anime en français par la communauté`
const DEFAULT_IMG  = `${SITE_URL}/og-default.jpg`

function stripHtml(str, len = 160) {
  return String(str ?? '').replace(/<[^>]+>/g, '').slice(0, len)
}

function send(res, opts = {}) {
  const title = opts.title ? `${opts.title} — ${SITE_NAME}` : SITE_NAME
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.send(renderMetaHtml({
    title,
    description: opts.description || DEFAULT_DESC,
    image:       opts.image || DEFAULT_IMG,
    url:         opts.url || SITE_URL,
    type:        opts.type || 'website',
    siteName:    SITE_NAME,
  }))
}

const STATIC_PAGES = {
  '/catalogue':   { title: 'Catalogue' },
  '/sorties':     { title: 'Dernières sorties' },
  '/actualites':  { title: 'Actualités' },
  '/equipe':      { title: 'Équipe' },
  '/classement':  { title: 'Classement', description: `Le classement des membres les plus actifs de ${SITE_NAME}` },
  '/recrutement': { title: 'Recrutement' },
  '/chat':        { title: 'Chat' },
  '/profil':      { title: 'Profil' },
}

router.get('/', (_req, res) => send(res, {}))

router.get('/serie/:id', async (req, res) => {
  const serie = await Series.findOne({ id: req.params.id, visible: { $ne: false } }).lean().catch(() => null)
  if (!serie) return send(res, {})
  send(res, {
    title:       serie.titleFull || serie.title,
    description: serie.synopsis
      ? stripHtml(serie.synopsis)
      : `${serie.titleFull} — ${serie.episodesAired ?? ''} épisodes, studio ${serie.studio ?? ''}.`,
    image: serie.banner || serie.poster,
    url:   `${SITE_URL}/serie/${serie.id}`,
  })
})

router.get('/actualite/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return send(res, {})
  const article = await News.findById(req.params.id).lean().catch(() => null)
  if (!article || article.published === false) return send(res, {})
  send(res, {
    title:       article.title,
    description: article.excerpt || stripHtml(article.contentHtml) || article.content?.[0]?.slice(0, 160) || '',
    image:       article.thumb,
    url:         `${SITE_URL}/actualite/${article._id}`,
    type:        'article',
  })
})

router.get('/profil/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return send(res, { title: 'Profil' })
  const user = await User.findById(req.params.id, 'username avatar').lean().catch(() => null)
  if (!user) return send(res, { title: 'Profil' })
  send(res, {
    title:       user.username,
    description: `Profil de ${user.username} sur ${SITE_NAME}`,
    image:       user.avatar,
    url:         `${SITE_URL}/profil/${user._id}`,
  })
})

router.get('/watch/:id/:season/:ep', async (req, res) => {
  const serie = await Series.findOne({ id: req.params.id, visible: { $ne: false } }).lean().catch(() => null)
  if (!serie) return send(res, {})
  const ep = findEpisode(serie, req.params.season, Number(req.params.ep))
  send(res, {
    title:       ep ? `${serie.titleFull} — Ép. ${ep.num}${ep.title ? ' : ' + ep.title : ''}` : serie.titleFull,
    description: serie.synopsis ? stripHtml(serie.synopsis) : serie.titleFull,
    image:       ep?.thumbnail || serie.banner || serie.poster,
    url:         `${SITE_URL}/watch/${serie.id}/${req.params.season}/${req.params.ep}`,
  })
})

// Toute autre page (connexion, inscription, admin, etc.) — meta générique du site,
// avec le titre de page connu si on l'a (cf. STATIC_PAGES).
router.get('*', (req, res) => {
  const page = STATIC_PAGES[req.path]
  send(res, page ? { ...page, url: `${SITE_URL}${req.path}` } : {})
})

module.exports = router
