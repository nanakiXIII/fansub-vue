const mongoose = require('mongoose')

const statSchema = new mongoose.Schema({
  type:         { type: String, enum: ['view', 'download'], required: true },
  serieId:      { type: String, required: true },
  serieTitle:   { type: String, default: '' },
  episodeNum:   { type: Number, default: null },
  episodeTitle: { type: String, default: '' },
  season:       { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Stat', statSchema)
