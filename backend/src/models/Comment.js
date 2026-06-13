const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', default: null },
  serieId:   { type: String, default: null },
  epNum:     { type: Number, default: null },
  userId:    { type: String, required: true },
  username:  { type: String, required: true },
  isLocal:   { type: Boolean, default: false },
  text:      { type: String, required: true, maxlength: 2000 },
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

commentSchema.index({ articleId: 1, status: 1 })
commentSchema.index({ serieId: 1, epNum: 1, status: 1 })

module.exports = mongoose.model('Comment', commentSchema)
