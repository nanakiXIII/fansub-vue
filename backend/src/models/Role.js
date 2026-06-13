const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  label:       { type: String, required: true },
  color:       { type: String, default: '' },
  level:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  permissions: [{ type: String }],
}, { timestamps: true })

module.exports = mongoose.model('Role', roleSchema)
