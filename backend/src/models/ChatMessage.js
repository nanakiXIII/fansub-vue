const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username:  { type: String, required: true },
  avatar:    { type: String, default: null },
  roleLabel: { type: String, default: null },
  roleColor: { type: String, default: null },
  text:      { type: String, required: true, maxlength: 500 },
  room:      { type: String, default: 'global' },
}, { timestamps: true })

schema.index({ room: 1, createdAt: -1 })
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }) // TTL 30 jours

module.exports = mongoose.model('ChatMessage', schema)
