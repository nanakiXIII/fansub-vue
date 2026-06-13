const mongoose = require('mongoose')

const achievementSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  icon:        { type: String, default: '🏆' },
  condition: {
    type:      { type: String, enum: ['downloads', 'comments', 'watched', 'favorites', 'days'], required: true },
    threshold: { type: Number, required: true, min: 1 },
  },
  rewardTitle: { type: String, default: '' },
  color:       { type: String, default: '#f97316' },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Achievement', achievementSchema)
