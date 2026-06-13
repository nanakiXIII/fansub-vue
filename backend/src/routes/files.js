const express = require('express')
const fs      = require('fs')
const path    = require('path')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/files?path=relative/path
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const mediaRoot = process.env.MEDIA_ROOT
  if (!mediaRoot) return res.status(503).json({ error: 'MEDIA_ROOT non configuré dans .env' })

  const relPath  = (req.query.path || '').replace(/\\/g, '/').replace(/^\//, '')
  const fullPath = path.resolve(mediaRoot, relPath)

  // Sécurité : on ne sort jamais de MEDIA_ROOT
  if (!fullPath.startsWith(path.resolve(mediaRoot))) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  try {
    const entries = fs.readdirSync(fullPath, { withFileTypes: true })
    const VIDEO_EXT = new Set(['.mp4', '.mkv', '.avi', '.webm', '.mov', '.m3u8', '.ts', '.vtt', '.srt', '.ass', '.ssa'])

    const result = entries
      .filter(e => !e.name.startsWith('.'))
      .filter(e => e.isDirectory() || VIDEO_EXT.has(path.extname(e.name).toLowerCase()))
      .map(e => ({
        name:  e.name,
        isDir: e.isDirectory(),
        path:  relPath ? `${relPath}/${e.name}` : e.name,
      }))
      .sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
        return a.name.localeCompare(b.name, 'fr')
      })

    res.json({ path: relPath, entries: result })
  } catch {
    res.status(404).json({ error: 'Dossier introuvable' })
  }
})

module.exports = router
