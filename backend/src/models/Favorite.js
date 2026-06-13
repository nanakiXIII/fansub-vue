const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:  { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  serieId: { type: String, required: true },
}, { timestamps: true })
schema.index({ userId: 1, serieId: 1 }, { unique: true })
module.exports = mongoose.model('Favorite', schema)
