// Dérive une palette complète de 10 couleurs (voir backend/src/models/Theme.js)
// à partir de 3 couleurs choisies par l'admin : un fond sombre, une couleur d'accent, et une
// couleur de texte. Les paliers de luminosité reproduisent la progression des thèmes intégrés
// (braise, sakura, ...).

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = 60 * (((g - b) / d) % 6); break
      case g: h = 60 * ((b - r) / d + 2); break
      case b: h = 60 * ((r - g) / d + 4); break
    }
  }
  if (h < 0) h += 360
  return { h, s: s * 100, l: l * 100 }
}

function hslToRgbString(h, s, l) {
  s = Math.min(100, Math.max(0, s)) / 100
  l = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if      (h < 60)  { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else              { r = c; g = 0; b = x }
  const R = Math.round((r + m) * 255)
  const G = Math.round((g + m) * 255)
  const B = Math.round((b + m) * 255)
  return `${R} ${G} ${B}`
}

export function hexToVarString(hex) {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

// Génère les 10 couleurs (format "R G B") depuis un fond sombre + un accent + une couleur de texte
export function deriveTheme(baseHex, accentHex, inkHex) {
  const base   = rgbToHsl(hexToRgb(baseHex))
  const accent = rgbToHsl(hexToRgb(accentHex))
  const ink    = rgbToHsl(hexToRgb(inkHex))

  return {
    bg0: hslToRgbString(base.h, base.s, base.l),
    bg1: hslToRgbString(base.h, base.s, base.l + 5),
    bg2: hslToRgbString(base.h, base.s, base.l + 9),
    bg3: hslToRgbString(base.h, base.s, base.l + 13),
    bg4: hslToRgbString(base.h, base.s, base.l + 18),
    orange:      hexToVarString(accentHex),
    orangeHover: hslToRgbString(accent.h, accent.s, Math.max(0, accent.l - 9)),
    ink1: hexToVarString(inkHex),
    ink2: hslToRgbString(ink.h, ink.s, 61),
    ink3: hslToRgbString(ink.h, ink.s, 40),
  }
}

export function slugify(label) {
  return label
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}
