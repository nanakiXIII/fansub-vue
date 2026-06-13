const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    serieId:    { type: String, required: true },
    seasonSlug: { type: String, required: true },
    epNum:      { type: Number, required: true },
    quality:    { type: String, default: 'FHD' },
    releasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

schema.index({ serieId: 1, seasonSlug: 1, epNum: 1 }, { unique: true })

module.exports = mongoose.model('Release', schema)
