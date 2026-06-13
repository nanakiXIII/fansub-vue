const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  category:    { type: String, required: true },
  author:      { type: String, default: '' },
  icon:        { type: String, default: '📰' },
  gradient:    { type: String, default: '' },
  content:     [{ type: String }],
  serieId:     { type: String, default: null },
  episodeNums: [{ type: Number }],
  date:        { type: String, default: '' },
  thumb:       { type: String, default: '' },
  excerpt:     { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  heroSource:  { type: String, default: 'custom' },
  published:   { type: Boolean, default: true },
  views:       { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('News', newsSchema)
