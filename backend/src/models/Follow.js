const { Schema, model } = require('mongoose')

const schema = new Schema({
  userId:  { type: String, required: true },
  serieId: { type: String, required: true },
}, { timestamps: true })

schema.index({ userId: 1, serieId: 1 }, { unique: true })

module.exports = model('Follow', schema)
