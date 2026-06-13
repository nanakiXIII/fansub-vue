const mongoose = require('mongoose')

const stepSchema = new mongoose.Schema(
  {
    label:   String,
    done:    { type: Boolean, default: false },
    current: { type: Boolean, default: false },
  },
  { _id: false }
)

const schema = new mongoose.Schema(
  {
    serieId:  { type: String, required: true },
    visible:  { type: Boolean, default: true },
    episode:  {
      num:      Number,
      title:    { type: String, default: '' },
      duration: { type: String, default: '' },
      lang:     { type: String, default: 'vostfr' },
    },
    translation: {
      pct:   { type: Number, default: 0 },
      eta:   { type: String, default: '' },
      steps: [stepSchema],
    },
    staff: {
      translator:  { type: String, default: null },
      proofreader: { type: String, default: null },
      timer:       { type: String, default: null },
      encoder:     { type: String, default: null },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('InProgress', schema)
