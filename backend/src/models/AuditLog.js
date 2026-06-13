const { Schema, model } = require('mongoose')

const s = new Schema({
  userId:   { type: String, default: null },
  username: { type: String, default: 'Système' },
  action:   { type: String, required: true },
  target:   { type: String, default: null },
  details:  { type: Schema.Types.Mixed, default: null },
  ip:       { type: String, default: null },
}, { timestamps: true })

s.index({ createdAt: -1 })
s.index({ action: 1 })
s.index({ userId: 1 })

module.exports = model('AuditLog', s)
