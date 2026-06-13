const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title:       { type: String, default: '' },
  description: { type: String, required: true, maxlength: 2000 },
  url:         { type: String, default: '' },
  userAgent:   { type: String, default: '' },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username:    { type: String, default: 'Anonyme' },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  reply:       {
    text:      { type: String, default: '' },
    author:    { type: String, default: '' },
    repliedAt: { type: Date,   default: null },
  },
}, { timestamps: true })

schema.index({ status: 1 })
schema.index({ createdAt: -1 })

module.exports = mongoose.model('BugReport', schema)
