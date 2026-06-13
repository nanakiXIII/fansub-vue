const express = require('express')
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
const crypto  = require('crypto')
const { requireAuth, requirePermission } = require('../middleware/auth')

const newsDir = path.join(__dirname, '../../uploads/news')
if (!fs.existsSync(newsDir)) fs.mkdirSync(newsDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: newsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Format non supporté. PNG, JPG, GIF ou WebP uniquement.'))
  },
})

const router = express.Router()

// POST /api/uploads/news — téléversement image article
router.post('/news', requireAuth, requirePermission('news.create'), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })
    const url = `${req.protocol}://${req.get('host')}/uploads/news/${req.file.filename}`
    res.json({ url })
  })
})

module.exports = router
