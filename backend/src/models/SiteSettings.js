const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  betaEnabled:             { type: Boolean,  default: false },
  maintenanceEnabled:      { type: Boolean,  default: false },
  maintenanceAllowedRoles: { type: [String], default: []    },
  foundedYear:             { type: Number,   default: 2019  },
  registrationEnabled:     { type: Boolean,  default: true  },
  chatEnabled:             { type: Boolean,  default: true  },
  defaultTheme:            { type: String,   default: 'braise'  },
  defaultLayout:           { type: String,   default: 'default' },
  enabledThemes:           { type: [String], default: ['braise', 'ametiste', 'abysses', 'sakura', 'air'] },
  enabledLayouts:          { type: [String], default: ['default', 'glass', 'gundam', 'flux', 'stream'] },
  // Effet météo décoratif superposé au site (aucun lien avec les thèmes/mises en page)
  seasonalEffect:          { type: String,   default: 'none', enum: ['none', 'snow', 'sakura'] },
  // Liens sociaux — modifiables depuis l'admin plutôt que le .env (évite un redéploiement
  // à chaque changement d'invite Discord, de pseudo Twitter, etc.). Vide = valeur par défaut
  // compilée (VITE_DISCORD_URL...) conservée côté frontend.
  discordUrl:              { type: String,   default: '' },
  twitterUrl:              { type: String,   default: '' },
  githubUrl:               { type: String,   default: '' },
}, { timestamps: true })

// Singleton — on ne crée qu'un seul document
schema.statics.get = async function () {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  return doc
}

schema.statics.patch = async function (data) {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  Object.assign(doc, data)
  await doc.save()
  return doc
}

module.exports = mongoose.model('SiteSettings', schema)
