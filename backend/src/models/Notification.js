const { Schema, model } = require('mongoose')

const schema = new Schema({
  userId:      { type: String, required: true, index: true },
  serieId:     { type: String, required: true },
  serieTitle:  { type: String },
  seriePoster: { type: String },
  seasonSlug:  { type: String },
  epNum:       { type: Number },
  epTitle:     { type: String },
  read:        { type: Boolean, default: false },
}, { timestamps: true })

module.exports = model('Notification', schema)
