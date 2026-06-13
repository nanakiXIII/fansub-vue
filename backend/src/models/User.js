const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email:     { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: null },
  password:  { type: String, default: null },
  googleId:  { type: String, unique: true, sparse: true, default: null },
  discordId: { type: String, unique: true, sparse: true, default: null },
  isAdmin:   { type: Boolean, default: false },
  avatar:        { type: String, default: null },
  role:          { type: String, default: null },
  activeTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', default: null },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
