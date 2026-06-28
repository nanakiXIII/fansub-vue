const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const favoriteMediaSchema = new mongoose.Schema({
  tmdbId:     { type: Number, required: true },
  mediaType:  { type: String, enum: ['movie', 'tv'], required: true },
  title:      { type: String, required: true },
  posterPath: { type: String, default: '' },
  year:       { type: String, default: '' },
}, { _id: false })

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  // Pas de `default: null` sur email/googleId/discordId : un sparse index unique exclut les champs
  // absents, mais PAS les valeurs `null` explicites — un default null créerait une collision dès
  // le 2e compte qui n'a pas ce champ (cf. bug "pseudo ou email déjà utilisé" sur un compte neuf).
  email:     { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password:  { type: String, default: null },
  googleId:  { type: String, unique: true, sparse: true },
  discordId: { type: String, unique: true, sparse: true },
  isAdmin:   { type: Boolean, default: false },
  // default true : ne pas casser les comptes existants ni les comptes OAuth (email déjà
  // vérifié par Google/Discord) lors de l'ajout de ce champ. Mis explicitement à false
  // à la création d'un compte classique email/mot de passe (cf. routes/auth.js /register).
  emailVerified:        { type: Boolean, default: true  },
  emailVerifyToken:     { type: String,  default: null  },
  emailVerifyExpires:   { type: Date,    default: null  },
  passwordResetToken:   { type: String,  default: null  },
  passwordResetExpires: { type: Date,    default: null  },
  avatar:        { type: String, default: null },
  role:          { type: String, default: null },
  activeTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', default: null },
  socials: {
    discord:     { type: String, default: '' },
    psn:         { type: String, default: '' },
    xbox:        { type: String, default: '' },
    switch:      { type: String, default: '' },
    steam:       { type: String, default: '' },
    myanimelist: { type: String, default: '' },
  },
  favoriteMedia: [favoriteMediaSchema],
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
