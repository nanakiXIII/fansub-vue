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
