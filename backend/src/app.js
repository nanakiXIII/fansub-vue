const express      = require('express')
const cors         = require('cors')
const path         = require('path')
const errorHandler = require('./middleware/errorHandler')

const authRouter       = require('./routes/auth')
const seriesRouter     = require('./routes/series')
const newsRouter       = require('./routes/news')
const commentsRouter   = require('./routes/comments')
const teamRouter       = require('./routes/team')
const userRouter       = require('./routes/user')
const publicUsersRouter = require('./routes/publicUsers')
const inProgressRouter = require('./routes/inprogress')
const releasesRouter   = require('./routes/releases')
const homeRouter       = require('./routes/home')
const recruitRouter    = require('./routes/recruit')
const filesRouter      = require('./routes/files')
const subtitlesRouter  = require('./routes/subtitles')
const statsRouter      = require('./routes/stats')
const uploadsRouter    = require('./routes/uploads')
const rolesRouter        = require('./routes/roles')
const achievementsRouter = require('./routes/achievements')
const analyticsRouter    = require('./routes/analytics')
const settingsRouter       = require('./routes/settings')
const bugsRouter           = require('./routes/bugs')
const followsRouter        = require('./routes/follows')
const notificationsRouter  = require('./routes/notifications')
const chatRouter           = require('./routes/chat')
const alertsRouter         = require('./routes/alerts')
const auditRouter          = require('./routes/audit')
const sitemapRouter        = require('./routes/sitemap')
const leaderboardRouter    = require('./routes/leaderboard')

const { passport } = require('./passport')

const app = express()

const _corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: _corsOrigin === '*' ? true : _corsOrigin, credentials: true }))
app.use(express.json())
app.use(passport.initialize())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Fichiers médias (vidéos) — chemin configurable via MEDIA_ROOT
if (process.env.MEDIA_ROOT) {
  app.use('/media', (req, res, next) => {
    if (req.query.dl === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(req.path)}"`)
    }
    next()
  }, express.static(process.env.MEDIA_ROOT))
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth',       authRouter)
app.use('/api/series',     seriesRouter)
app.use('/api/news',       newsRouter)
app.use('/api/comments',   commentsRouter)
app.use('/api/team',       teamRouter)
app.use('/api/user',       userRouter)
app.use('/api/users',      publicUsersRouter)
app.use('/api/inprogress', inProgressRouter)
app.use('/api/recruit',   recruitRouter)
app.use('/api/files',      filesRouter)
app.use('/api/subtitles',  subtitlesRouter)
app.use('/api/stats',      statsRouter)
app.use('/api/uploads',    uploadsRouter)
app.use('/api/releases',   releasesRouter)
app.use('/api/home',       homeRouter)
app.use('/api/roles',        rolesRouter)
app.use('/api/achievements', achievementsRouter)
app.use('/api/analytics',   analyticsRouter)
app.use('/api/settings',       settingsRouter)
app.use('/api/bugs',           bugsRouter)
app.use('/api/follows',        followsRouter)
app.use('/api/notifications',  notificationsRouter)
app.use('/api/chat',           chatRouter)
app.use('/api/alerts',         alertsRouter)
app.use('/api/audit',          auditRouter)
app.use('/api/leaderboard',    leaderboardRouter)

app.use('/sitemap.xml',        sitemapRouter)

app.use(errorHandler)

module.exports = app
