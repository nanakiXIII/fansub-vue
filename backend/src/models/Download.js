const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:      { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  serieId:     { type: String, required: true },
  seasonSlug:  { type: String, required: true },
  epNum:       { type: Number, required: true },
  quality:     { type: String, default: null },
  lang:        { type: String, default: null },
  downloadedAt:{ type: Date, default: Date.now },
})
schema.index({ userId: 1, serieId: 1, seasonSlug: 1, epNum: 1 }, { unique: true })
module.exports = mongoose.model('Download', schema)
