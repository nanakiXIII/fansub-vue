const express = require('express')
const { execFile } = require('child_process')
const path    = require('path')
const fs      = require('fs')
const { requireAuth, requirePermission } = require('../middleware/auth')

const router = express.Router()

// POST /api/subtitles/extract
// body: { filePath: 'relative/path/to/video.mkv' }
router.post('/extract', requireAuth, requirePermission('series.edit'), (req, res) => {
  const mediaRoot = process.env.MEDIA_ROOT
  if (!mediaRoot) return res.status(503).json({ error: 'MEDIA_ROOT non configuré' })

  const { filePath } = req.body
  if (!filePath) return res.status(400).json({ error: 'filePath requis' })

  const relPath      = filePath.replace(/\\/g, '/').replace(/^\//, '')
  const fullVideo    = path.resolve(mediaRoot, relPath)

  if (!fullVideo.startsWith(path.resolve(mediaRoot))) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  if (!fs.existsSync(fullVideo)) {
    return res.status(404).json({ error: 'Fichier vidéo introuvable' })
  }

  const vttRel  = relPath.replace(/\.[^.]+$/, '.vtt')
  const fullVtt = path.resolve(mediaRoot, vttRel)

  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'

  // ffmpeg -y -i <input> -map 0:s:0 -c:s webvtt <output>
  execFile(ffmpeg, ['-y', '-i', fullVideo, '-map', '0:s:0', '-c:s', 'webvtt', fullVtt], { timeout: 120000 }, (err, _stdout, stderr) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(500).json({ error: 'ffmpeg introuvable', detail: `Installez ffmpeg et ajoutez-le au PATH, ou définissez FFMPEG_PATH dans .env` })
      }
      const lastLines = (stderr || '').split('\n').filter(Boolean).slice(-4).join(' | ')
      return res.status(500).json({ error: 'Extraction échouée', detail: lastLines || err.message })
    }
    res.json({ vttPath: vttRel })
  })
})

module.exports = router
