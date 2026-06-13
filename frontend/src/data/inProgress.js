// src/data/inProgress.js
// Épisodes actuellement en cours de traduction — alimente le carrousel de la page d'accueil.
// À remplacer par l'appel API (src/api/inProgress.js) une fois le backend prêt.
//
// Chaque entrée représente un épisode assigné à l'équipe, avec :
//   - la référence à la série (serieId → les infos visuelles viennent de src/data/series.js)
//   - les infos de l'épisode en cours
//   - la progression de la traduction, étape par étape
//   - le staff assigné et une estimation de sortie
//
// Étapes de traduction dans l'ordre :
//   1. Brut         — le fichier vidéo brut (RAW) est disponible
//   2. Traduction   — traduction JP → FR en cours
//   3. Correction   — relecture et correction stylistique
//   4. Timing       — calage des sous-titres sur la vidéo
//   5. Encodage     — encodage final (vidéo + sous-titres)
//   6. Mise en ligne — publication sur le site
//
// pct (0-100) : avancement global calculé depuis les étapes,
//               peut aussi être fourni directement par l'API.
//
// visible (boolean, défaut true) :
//   false = entrée masquée du carrousel public, visible uniquement en mode admin.
//   Suit généralement la visibilité de la série liée (serie.visible === false → visible: false).

export const inProgress = [
  {
    // ── Jujutsu Kaisen S3 — EP 24 ────────────────────────────────────────────
    serieId: 'jujutsu-kaisen-s3',
    visible: true,

    episode: {
      num:      24,
      title:    "Le Domaine d'expansion ultime",
      duration: '24 min',
      lang:     'vostfr',   // langue en cours de traduction
    },

    translation: {
      pct: 65,              // avancement global (%)
      eta: 'Ce soir',       // estimation de mise en ligne (texte libre)
      steps: [
        { label: 'Brut',          done: true,  current: false },
        { label: 'Traduction',    done: true,  current: false },
        { label: 'Correction',    done: false, current: true  },
        { label: 'Timing',        done: false, current: false },
        { label: 'Encodage',      done: false, current: false },
        { label: 'Mise en ligne', done: false, current: false },
      ],
    },

    staff: {
      translator:  'Kitsune_sub',
      proofreader: 'HanaeN',
      timer:       null,       // null = pas encore assigné
      encoder:     null,
    },
  },

  {
    // ── Kimetsu no Yaiba S4 — EP 12 ──────────────────────────────────────────
    serieId: 'kimetsu-s4',
    visible: true,

    episode: {
      num:      12,
      title:    'Le Pilier de la Brume',
      duration: '23 min',
      lang:     'vf',
    },

    translation: {
      pct: 90,
      eta: 'Dans 2h',
      steps: [
        { label: 'Brut',          done: true,  current: false },
        { label: 'Traduction',    done: true,  current: false },
        { label: 'Correction',    done: true,  current: false },
        { label: 'Timing',        done: true,  current: false },
        { label: 'Encodage',      done: false, current: true  },
        { label: 'Mise en ligne', done: false, current: false },
      ],
    },

    staff: {
      translator:  'Sakura_TL',
      proofreader: 'Yumi_K',
      timer:       'Mei_Otaku',
      encoder:     'Zephyr_Edit',
    },
  },

  {
    // ── Chainsaw Man S2 — EP 8 ────────────────────────────────────────────────
    serieId: 'chainsaw-man-s2',
    visible: true,

    episode: {
      num:      8,
      title:    'Violence et Sang',
      duration: '25 min',
      lang:     'vostfr',
    },

    translation: {
      pct: 30,
      eta: 'Demain',
      steps: [
        { label: 'Brut',          done: true,  current: false },
        { label: 'Traduction',    done: false, current: true  },
        { label: 'Correction',    done: false, current: false },
        { label: 'Timing',        done: false, current: false },
        { label: 'Encodage',      done: false, current: false },
        { label: 'Mise en ligne', done: false, current: false },
      ],
    },

    staff: {
      translator:  'BloodSub',
      proofreader: null,
      timer:       null,
      encoder:     null,
    },
  },

  {
    // ── Blue Box — EP 16 ──────────────────────────────────────────────────────
    serieId: 'blue-box',
    visible: true,

    episode: {
      num:      16,
      title:    'Le Match retour',
      duration: '23 min',
      lang:     'vf',
    },

    translation: {
      pct: 50,
      eta: 'Ce soir',
      steps: [
        { label: 'Brut',          done: true,  current: false },
        { label: 'Traduction',    done: true,  current: false },
        { label: 'Correction',    done: false, current: true  },
        { label: 'Timing',        done: false, current: false },
        { label: 'Encodage',      done: false, current: false },
        { label: 'Mise en ligne', done: false, current: false },
      ],
    },

    staff: {
      translator:  'HanaHana',
      proofreader: 'SportSub',
      timer:       null,
      encoder:     null,
    },
  },

  {
    // ── Berserk of Gluttony — EP 12 ───────────────────────────────────────────
    serieId: 'berserk-of-gluttony',
    visible: false,

    episode: {
      num:      12,
      title:    'La Faim du néant',
      duration: '23 min',
      lang:     'vostfr',
    },

    translation: {
      pct: 15,
      eta: 'Dans 3 jours',
      steps: [
        { label: 'Brut',          done: true,  current: false },
        { label: 'Traduction',    done: false, current: true  },
        { label: 'Correction',    done: false, current: false },
        { label: 'Timing',        done: false, current: false },
        { label: 'Encodage',      done: false, current: false },
        { label: 'Mise en ligne', done: false, current: false },
      ],
    },

    staff: {
      translator:  'BloodSub',
      proofreader: null,
      timer:       null,
      encoder:     null,
    },
  },
]

export function getInProgressBySerie(serieId) {
  return inProgress.find(e => e.serieId === serieId) ?? null
}
