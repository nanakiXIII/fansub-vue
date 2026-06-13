const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  path:      { type: String, required: true },
  pageType:  { type: String, default: 'other' }, // home|serie|news|catalogue|equipe|other
  pageId:    { type: String, default: null },
  source:    { type: String, default: 'Direct' }, // Direct|Google|Bing|Twitter|etc.
  country:   { type: String, default: null },      // code ISO 2 lettres
  sessionId: { type: String, default: null },
}, { timestamps: true })

// Index pour les agrégations fréquentes
schema.index({ createdAt: -1 })
schema.index({ pageType: 1, createdAt: -1 })
schema.index({ country: 1 })
schema.index({ source: 1 })

// TTL : supprime les entrées de plus de 90 jours automatiquement
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

module.exports = mongoose.model('PageView', schema)
