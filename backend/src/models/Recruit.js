const mongoose = require('mongoose')

const recruitSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  icon:        { type: String, default: '' },
  color:       { type: String, default: '' },
  open:        { type: Boolean, default: true },
  description: { type: String, default: '' },
  tags:        [{ type: String }],
  order:       { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Recruit', recruitSchema)
