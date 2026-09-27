const mongoose = require('mongoose')

// Palette de couleurs personnalisée créée depuis l'admin — vient s'ajouter aux thèmes
// intégrés (braise/ametiste/abysses/sakura/air) codés en dur côté frontend.
// Chaque couleur est stockée au format "R G B" (ex: "244 117 33"), identique au format
// des variables CSS --color-* déjà utilisées partout dans le site.
const themeSchema = new mongoose.Schema({
  slug:  { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]{2,30}$/ },
  label: { type: String, required: true, trim: true, minlength: 2, maxlength: 30 },
  colors: {
    bg0:         { type: String, required: true },
    bg1:         { type: String, required: true },
    bg2:         { type: String, required: true },
    bg3:         { type: String, required: true },
    bg4:         { type: String, required: true },
    orange:      { type: String, required: true },
    orangeHover: { type: String, required: true },
    ink1:        { type: String, required: true },
    ink2:        { type: String, required: true },
    ink3:        { type: String, required: true },
  },
}, { timestamps: true })

module.exports = mongoose.model('Theme', themeSchema)
