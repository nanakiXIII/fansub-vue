const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  slug:           { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  role:           { type: String, default: '' },
  department:     { type: String, enum: ['Direction', 'Traduction', 'Édition', 'Communauté', 'Ancien Membre'], required: true },
  initials:       { type: String, default: '' },
  avatarGradient: { type: String, default: '' },
  joined:         { type: String, default: '' },
  bio:            { type: String, default: '' },
  tags:           [{ type: String }],
  active:         { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Team', teamSchema)
